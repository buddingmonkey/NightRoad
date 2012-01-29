
#pragma strict

@script ExecuteInEditMode
@script RequireComponent (Camera)
@script AddComponentMenu ("Image Effects/Tonemapping")

class Tonemapping extends PostEffectsBase {
	
	public enum TonemapperType { 
		SimpleReinhard = 0x0,
		Curve = 0x1,
		Uncharted = 0x2,
		Photographic = 0x3,
		OptimizedHejiDawson = 0x4,
		AdaptiveReinhard = 0x5,	
	};
 
	public enum AdaptiveTexSize {
		Square16 = 16,
		Square32 = 32,
		Square64 = 64,
		Square128 = 128,
		Square256 = 256,
		Square512 = 512,
		Square1024 = 1024,
	};
	
	public var type : TonemapperType = TonemapperType.SimpleReinhard;
	public var adaptiveTextureSize = AdaptiveTexSize.Square256;
	
	// CURVE parameter
	public var remapCurve : AnimationCurve;
	private var curveTex : Texture2D = null;
	
	// UNCHARTED parameter
	public var exposureAdjustment : float = 2.0f;
	
	// REINHARD parameter
	public var middleGrey : float = 0.4f;
	public var white : float = 2.0f;
	public var adaptionSpeed : float = 1.5f;

    // usual & internal stuff
	public var tonemapper : Shader = null;
	private var tonemapMaterial : Material = null;	
	private var rt : RenderTexture = null;
	
	function CreateMaterials () {
		tonemapMaterial = CheckShaderAndCreateMaterial(tonemapper, tonemapMaterial);
		if (!curveTex && type == TonemapperType.Curve) {
			curveTex = new Texture2D (256, 1, TextureFormat.ARGB32, false);		
			curveTex.filterMode = FilterMode.Bilinear;
			curveTex.wrapMode = TextureWrapMode.Clamp;
			curveTex.hideFlags = HideFlags.DontSave;
		}
	}
	
	function Start () {
		CreateMaterials ();
		CheckSupport (false);
	}
	
	public function UpdateCurve () : float {	
        var range : float = 1.0f;		
		if(!remapCurve)
			remapCurve =  new AnimationCurve(Keyframe(0, 0), Keyframe(2, 1));	
		if (remapCurve) {		
			if(remapCurve.length)
				range = remapCurve[remapCurve.length-1].time;			
			for (var i : float = 0.0f; i <= 1.0f; i += 1.0f / 255.0f) {
				var c : float = remapCurve.Evaluate(i * 1.0f * range);
				curveTex.SetPixel (Mathf.Floor(i*255.0f), 0, Color(c,c,c));
			}
			curveTex.Apply ();			
		}
		return 1.0f / range;
	}	
	
	function CreateInternalRenderTexture () {
		if (rt)
			return;
		rt = new RenderTexture(1,1, 0, RenderTextureFormat.ARGBHalf);
		var oldrt : RenderTexture = RenderTexture.active;
		RenderTexture.active = rt;
		GL.Clear(false, true, Color.grey);
		rt.hideFlags = HideFlags.DontSave;		
		RenderTexture.active = oldrt;
	}
		
	@ImageEffectTransformsToLDR	
	function OnRenderImage (source : RenderTexture, destination : RenderTexture) {		
		CreateMaterials ();
		
		// clamp some values to not go out of a valid range
		exposureAdjustment = exposureAdjustment < 0.001f ? 0.001f : exposureAdjustment;
		
		// SimpleReinhard tonemappers (local, non adaptive)
		
		if(type == TonemapperType.Curve) {
			var rangeScale : float = UpdateCurve ();
			tonemapMaterial.SetFloat("_RangeScale", rangeScale);	
			tonemapMaterial.SetTexture("_Curve", curveTex);		
			Graphics.Blit(source, destination, tonemapMaterial, 4);		
			return;	
		}
		
		if(type == TonemapperType.SimpleReinhard) {
			tonemapMaterial.SetFloat("_ExposureAdjustment", exposureAdjustment);	
			Graphics.Blit(source, destination, tonemapMaterial, 6);		
			return;	
		}
		
		if(type == TonemapperType.Uncharted) {
			tonemapMaterial.SetFloat("_ExposureAdjustment", exposureAdjustment);
			Graphics.Blit(source, destination, tonemapMaterial, 5);
			return;	
		}
		
		if(type == TonemapperType.Photographic) {
			tonemapMaterial.SetFloat("_ExposureAdjustment", exposureAdjustment);
			Graphics.Blit(source, destination, tonemapMaterial, 8);
			return;
		}

		if(type == TonemapperType.OptimizedHejiDawson) {
			tonemapMaterial.SetFloat("_ExposureAdjustment", 0.5f * exposureAdjustment);
			Graphics.Blit(source, destination, tonemapMaterial, 7);
			return;
		}
		
		// still here? 
		// => more complex adaptive reinhard tone mapping:
		// builds an average log luminance, tonemaps according to 
		// middle grey and white values (user controlled)
		
		CreateInternalRenderTexture ();
			
		var rtSquared : RenderTexture = RenderTexture.GetTemporary(adaptiveTextureSize, adaptiveTextureSize, 0, RenderTextureFormat.ARGBHalf);
		Graphics.Blit(source, rtSquared);
				
		var downsample : int = Mathf.Log(rtSquared.width * 1.0f, 2);
				
		var div : int = 2;
		var rts : RenderTexture[] = new RenderTexture[downsample];
		for(var i : int = 0; i < downsample; i++) {
			rts[i] = RenderTexture.GetTemporary(rtSquared.width / div, rtSquared.width / div, 0, RenderTextureFormat.ARGBHalf);
			div *= 2;
		}

		var ar : float = (source.width * 1.0f) / (source.height * 1.0f);

		// downsample pyramid
		var lumRt = rts[downsample-1];		
		if(type == TonemapperType.AdaptiveReinhard)
			Graphics.Blit(rtSquared, rts[0], tonemapMaterial, 1); 
		else
			Graphics.Blit(rtSquared, rts[0]);
		for(i = 0; i < downsample-1; i++) {
			Graphics.Blit(rts[i], rts[i+1]); 
			lumRt = rts[i+1];
		}		
		
		// we have the needed values, let's apply adaptive tonemapping
		if (type == TonemapperType.AdaptiveReinhard) {
			adaptionSpeed = adaptionSpeed < 0.001f ? 0.001f : adaptionSpeed;	
			#if UNITY_EDITOR
				tonemapMaterial.SetFloat("_AdaptionSpeed", adaptionSpeed);
				if(Application.isPlaying)
					Graphics.Blit(lumRt, rt, tonemapMaterial, 2); 	
				else 
					Graphics.Blit(lumRt, rt, tonemapMaterial, 3); 		
			#else
					tonemapMaterial.SetFloat("_AdaptionSpeed", adaptionSpeed);
					Graphics.Blit(lumRt, rt, tonemapMaterial, 2); 	
			#endif	

			middleGrey = middleGrey < 0.001f ? 0.001f : middleGrey;	
			tonemapMaterial.SetVector("_HdrParams", Vector4(middleGrey, middleGrey, middleGrey, white*white));
			tonemapMaterial.SetTexture("_SmallTex", rt);		
			Graphics.Blit (source, destination, tonemapMaterial, 0); 	
		}
		else
			Debug.LogError("No valid adaptive tonemapper type found!");
			
		for(i = 0; i < downsample; i++) {
			RenderTexture.ReleaseTemporary(rts[i]);
		}
		RenderTexture.ReleaseTemporary(rtSquared);
	}
}