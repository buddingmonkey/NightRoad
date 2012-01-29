
#pragma strict

@script ExecuteInEditMode
@script RequireComponent (Camera)
@script AddComponentMenu ("Image Effects/Depth of Field (HDR, Bokeh)") 

class DepthOfFieldHdr extends PostEffectsBase {	

	enum DofHDRResolution {
		High = 1,
		Medium = 2,
		Low = 4,	
	}
	
	enum DofHDRBlurType {
		CheapGauss = 0,
		Bokeh = 1,
		OptimizedBokeh = 2,	 
	}	
	
	public var blurType : DofHDRBlurType = DofHDRBlurType.OptimizedBokeh;
	public var resolution : DofHDRResolution  = DofHDRResolution.High;
	public var blurIterations : int = 1;
	
	public var focalPoint : float = 1.0f;
	public var smoothness : float = 0.5f;
	public var focalTransform : Transform = null;
	public var focalSize : float = 0.0f;
    public var visualizeFocus : boolean = false;
	
	public var backgroundCocStrength : float = 0.5f;
	public var blurWidth : float = 1.75f;
	public var foregroundOverlap : float = 0.7f;
	public var dofHdrShader : Shader;		
	
	private var focalStartCurve : float = 2.0f;
	private var focalEndCurve : float = 2.0f;
	private var focalDistance01 : float = 0.1f;	
	
	private var dofHdrMaterial : Material = null;		        
    private var widthOverHeight : float = 1.25f;
    private var oneOverBaseSize : float = 1.0f / 512.0f;	
        	
	function CreateMaterials () {		
		dofHdrMaterial = CheckShaderAndCreateMaterial (dofHdrShader, dofHdrMaterial);  
	}
	
	function Start () {
		CreateMaterials ();
		// we need depth AND hdr support
		CheckSupport (true, true);
	}

	function OnEnable() {
		camera.depthTextureMode |= DepthTextureMode.Depth;		
	}
	
	function FocalDistance01 (worldDist : float) : float {
		return camera.WorldToViewportPoint((worldDist-camera.nearClipPlane) * camera.transform.forward + camera.transform.position).z / (camera.farClipPlane-camera.nearClipPlane);	
	}
	
	function OnRenderImage (source : RenderTexture, destination : RenderTexture) {	
		/*
		------------------------------------------------------------------------------------------
		------------------------------------------------------------------------------------------		
		HDR DEPTH OF FIELD -----------------------------------------------------------------------
		------------------------------------------------------------------------------------------
		OK the new algorithm is soooo much better & nicer and polished and shit!
		------------------------------------------------------------------------------------------
		------------------------------------------------------------------------------------------
		
		capturing circle of confusion & premultiply
		------------------------------------------------------------------------------------------
		[1a] IF NEEDED: calculate foreground coc into medium rez rt
		[1b] IF NEEDED: blur foreground coc a bit
		[1c] IF NEEDED: add foreground coc to background coc (max blend)
		[2] calculate background coc into alpha
		
		blurrrrr
		------------------------------------------------------------------------------------------
		[3] make sure colors are coc-premultiplied
		[4] blur is now super simple. chose one out of many possible blur techniques.
		
		final pass / apply
		------------------------------------------------------------------------------------------
		[5] apply blurred version onto screen via coc lookup
		
		------------------------------------------------------------------------------------------
		------------------------------------------------------------------------------------------			
		*/		
		
		/*if(source.format != RenderTextureFormat.ARGBHalf) {
			Debug.LogWarning("HDR Depth of Field requires HDR camera to work properly. Disabling component.", transform);
			enabled = false;
			Graphics.Blit(source, destination);
			return;
		}*/
		
		CreateMaterials ();
		
		var i : int = 0;
		var internalBlurWidth : float = blurWidth;
		
		// clamp values
		if (smoothness < 0.35f) smoothness = 0.35f;
		if (focalSize < 0.00001f) focalSize = 0.00001f;
		blurIterations = blurIterations < 1 ? 1 : blurIterations;
			
		// calculate needed parameters
		var div : int = resolution;		
		var focal01Size : float = focalSize / (camera.farClipPlane - camera.nearClipPlane);
	
		focalDistance01 = focalTransform ? (camera.WorldToViewportPoint (focalTransform.position)).z / (camera.farClipPlane) : FocalDistance01 (focalPoint);
		focalStartCurve = focalDistance01 * smoothness;
		focalEndCurve = focalStartCurve;
		widthOverHeight = (1.0f * source.width) / (1.0f * source.height);
		oneOverBaseSize = 1.0f / 512.0f;				
		
		// renderTextures
		var rtA : RenderTexture = RenderTexture.GetTemporary(source.width/div, source.height/div, 0, RenderTextureFormat.ARGBHalf);
		var rtB : RenderTexture = RenderTexture.GetTemporary(source.width/div, source.height/div, 0, RenderTextureFormat.ARGBHalf);
		var rtC : RenderTexture = RenderTexture.GetTemporary(source.width/div, source.height/div, 0, RenderTextureFormat.ARGBHalf);	
        		
		dofHdrMaterial.SetVector ("_CurveParams", Vector4 (1.0f / focalStartCurve, 1.0f / focalEndCurve*backgroundCocStrength, focal01Size * 0.5, focalDistance01));
		dofHdrMaterial.SetVector ("_InvRenderTargetSize", Vector4 (1.0 / (1.0 * source.width), 1.0 / (1.0 * source.height),0.0,0.0));
		
		// Capture foreground coc in alpha channel		
		Graphics.Blit (source /* need to bind source so we can detect screen flipiness */, source, dofHdrMaterial, 5); 		
		Graphics.Blit (source, rtA, dofHdrMaterial, 7);
		
		// Blur foreground coc a bit so we get COC overlaps
		Blur (rtA, rtA, rtC, internalBlurWidth * foregroundOverlap, 11);	
		//Blur (rtA, rtA, rtC, internalBlurWidth * foregroundOverlap, 11);	
		
		// capture background coc and mix in with foreground coc
		dofHdrMaterial.SetTexture ("_TapLowA", rtA);
		Graphics.Blit (source, source, dofHdrMaterial, 3); 		
		Graphics.Blit (source, rtB); 
		
		// blurs
		if(blurType == DofHDRBlurType.OptimizedBokeh) {
			BlurPseudoBokehOptimized (rtB, rtA, rtC, internalBlurWidth);
		}
		else if (blurType == DofHDRBlurType.Bokeh) {
			Blur (rtB, rtB, rtC, internalBlurWidth * 0.85f, 6);	
			BlurPseudoBokehOptimized (rtB, rtA, rtC, internalBlurWidth);	
			// just in case reference blur looks like this		
			//BlurPseudoBokeh (rtB, rtA, rtC, internalBlurWidth);
		}
		else {
			for(i = 0; i < blurIterations; i++)
				Blur (rtB, rtB, rtC, internalBlurWidth * 4.0f, 6);	
		}
		
		// final pass (apply blurs to screen)
		dofHdrMaterial.SetTexture ("_TapLowA", blurType == DofHDRBlurType.CheapGauss ? rtB : rtA);
		Graphics.Blit (source, destination, dofHdrMaterial, visualizeFocus ? 1 : 0);
		
		RenderTexture.ReleaseTemporary(rtA);
		RenderTexture.ReleaseTemporary(rtB);
		RenderTexture.ReleaseTemporary(rtC);
	}
	
	function Blur (from : RenderTexture, to : RenderTexture, work : RenderTexture, spread : float, pass : int) {
		dofHdrMaterial.SetVector ("_Offsets", Vector4 (0.0f, spread * oneOverBaseSize, 0.0f, 0.0f));
		Graphics.Blit (from, work, dofHdrMaterial, pass);
		dofHdrMaterial.SetVector ("_Offsets", Vector4 (spread / widthOverHeight * oneOverBaseSize,  0.0f, 0.0f, 0.0f));		
		Graphics.Blit (work, to, dofHdrMaterial, pass);	 				
	}	
	
	function BlurPseudoBokeh (from : RenderTexture, to : RenderTexture,  tmp : RenderTexture, spread : float) {		
		var blurPass : int = 10;
		var applyPass : int = 4;
		var dist : float = 1.0f;
		var shearedDistY : float = 0.75f;
		var shearedDistX : float = 1.0f;
		var shearedLen = Mathf.Sqrt(shearedDistY*shearedDistY + shearedDistX*shearedDistX);
		shearedDistY /= shearedLen;
		shearedDistX /= shearedLen;
		dist *= spread * (1.0f / (1.0f * to.height));
		shearedDistX *= spread * (1.0f /  (1.0f * to.width));
		shearedDistY *= spread * (1.0f /  (1.0f * to.height));
				
		RenderTexture.active = to;
		GL.Clear(false, true, Color(0,0,0,0));
		
		// UP
		dofHdrMaterial.SetVector ("_Offsets", Vector4 (0.0f, dist, 0.0f, 0.0f));
		Graphics.Blit (from, tmp, dofHdrMaterial, blurPass);
		// LD
		dofHdrMaterial.SetVector ("_Offsets", Vector4 (-shearedDistX, -shearedDistY, 0.0f, 0.0f));
		Graphics.Blit (tmp, to, dofHdrMaterial, applyPass);

		// UP
		dofHdrMaterial.SetVector ("_Offsets", Vector4 (0.0f, dist, 0.0f, 0.0f));
		Graphics.Blit (from, tmp, dofHdrMaterial, blurPass);
		// RD
		dofHdrMaterial.SetVector ("_Offsets", Vector4 (shearedDistX, -shearedDistY, 0.0f, 0.0f));
		Graphics.Blit (tmp, to, dofHdrMaterial, applyPass);			
	
		// LD
		dofHdrMaterial.SetVector ("_Offsets", Vector4 (-shearedDistX, -shearedDistY, 0.0f, 0.0f));
		Graphics.Blit (from, tmp, dofHdrMaterial, blurPass);	
		// RD
		dofHdrMaterial.SetVector ("_Offsets", Vector4 (shearedDistX, -shearedDistY, 0.0f, 0.0f));
		Graphics.Blit (tmp, to, dofHdrMaterial, applyPass);	
	}
	
	function BlurPseudoBokehOptimized (from : RenderTexture, to : RenderTexture,  tmp : RenderTexture, spread : float) {		
		var dist : float = 1.0f;
		var shearedDistY : float = 0.75f;
		var shearedDistX : float = 1.0f;
		var shearedLen = Mathf.Sqrt(shearedDistY*shearedDistY + shearedDistX*shearedDistX);
		shearedDistY /= shearedLen;
		shearedDistX /= shearedLen;
		dist *= spread * (1.0f / (1.0f * to.height));
		shearedDistX *= spread * (1.0f /  (1.0f * to.width));
		shearedDistY *= spread * (1.0f /  (1.0f * to.height));
		
		// WE ARE SAVING:
		// 2 blur passes
		// 1 apply pass
		// 1 clear pass
		// BUT:
		// optimized blur come at a cost of an additional render texture :(
		
		var tmp2 : RenderTexture = RenderTexture.GetTemporary(tmp.width, tmp.height, 0, RenderTextureFormat.ARGBHalf);
		
		// UP
		dofHdrMaterial.SetVector ("_Offsets", Vector4 (0.0f, dist, 0.0f, 0.0f));
		// LD
		dofHdrMaterial.SetVector ("_Offsets2", Vector4 (-shearedDistX, -shearedDistY, 0.0f, 0.0f));
		
		var dests : RenderBuffer[] = [tmp.colorBuffer, tmp2.colorBuffer];
		Graphics.SetRenderTarget(dests, to.depthBuffer);
		dofHdrMaterial.SetTexture ("_MainTex", from);	 		
		DofBlitMRT(dofHdrMaterial, 13);	
	
		// LD
		dofHdrMaterial.SetVector ("_Offsets", Vector4 (-shearedDistX, -shearedDistY, 0.0f, 0.0f));
		// RD
		dofHdrMaterial.SetVector ("_Offsets2", Vector4 (shearedDistX, -shearedDistY, 0.0f, 0.0f));

		Graphics.SetRenderTarget(to.colorBuffer, to.depthBuffer);
		dofHdrMaterial.SetTexture ("_MainTex", tmp);	 		
		dofHdrMaterial.SetTexture ("_MainTex2", tmp2);	 
		DofBlitMRT(dofHdrMaterial, 14);	// actually renders to a simple SRT
		
		RenderTexture.ReleaseTemporary(tmp2);
	}	
	
	static function DofBlitMRT (fxMaterial : Material, passNr : int) {
		// var invertY : boolean = source.texelSize.y < 0.0f;
		GL.PushMatrix ();
		GL.LoadOrtho ();
		fxMaterial.SetPass (passNr);	
	    GL.Begin (GL.QUADS);				
		GL.MultiTexCoord2 (0, 0.0f, 0.0f); 
		GL.Vertex3 (0.0f, 0.0f, 0.0f); // BL
		GL.MultiTexCoord2 (0, 1.0f, 0.0f); 
		GL.Vertex3 (1.0f, 0.0f, 0.0f); // BR
		GL.MultiTexCoord2 (0, 1.0f, 1.0f); 
		GL.Vertex3 (1.0f, 1.0f, 0.0f); // TR
		GL.MultiTexCoord2 (0, 0.0f, 1.0f); 
		GL.Vertex3 (0.0f, 1.0f, 0.0); // TL
		GL.End ();
	    GL.PopMatrix ();
	}	
}
