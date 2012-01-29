
#pragma strict

@CustomEditor (Tonemapping)

class TonemappingEditor extends Editor 
{	
	var serObj : SerializedObject;	
	 
	var type : SerializedProperty;;
	
	// CURVE specific parameter
	var remapCurve : SerializedProperty;
	
	var exposureAdjustment : SerializedProperty;
	
	// REINHARD specific parameter
	var middleGrey : SerializedProperty;
	var white : SerializedProperty;
	var adaptionSpeed : SerializedProperty;
	var adaptiveTextureSize : SerializedProperty;

	function OnEnable () {
		serObj = new SerializedObject (target);
		
		type = serObj.FindProperty ("type");
		remapCurve = serObj.FindProperty ("remapCurve");
		exposureAdjustment = serObj.FindProperty ("exposureAdjustment");
		middleGrey = serObj.FindProperty ("middleGrey");
		white = serObj.FindProperty ("white");
		adaptionSpeed = serObj.FindProperty ("adaptionSpeed");
		adaptiveTextureSize = serObj.FindProperty("adaptiveTextureSize");
	}
    		
    function OnInspectorGUI () {        
    	serObj.Update ();
    	
		GUILayout.Label("Mapping HDR to LDR ranges since 1982", EditorStyles.miniBoldLabel);
    	
    	EditorGUILayout.PropertyField (type, new GUIContent ("Technique"));

		if (type.enumValueIndex == Tonemapping.TonemapperType.Curve) {  	
    		EditorGUILayout.PropertyField (remapCurve, new GUIContent ("Remap curve", "Specify the mapping of luminances yourself"));
		} else if (type.enumValueIndex == Tonemapping.TonemapperType.SimpleReinhard) {  	
    		EditorGUILayout.PropertyField (exposureAdjustment, new GUIContent ("Exposure", "Exposure adjustment"));			
		} else if (type.enumValueIndex == Tonemapping.TonemapperType.Uncharted) { 	
    		EditorGUILayout.PropertyField (exposureAdjustment, new GUIContent ("Exposure", "Exposure adjustment"));			
		} else if (type.enumValueIndex == Tonemapping.TonemapperType.Photographic) { 	
    		EditorGUILayout.PropertyField (exposureAdjustment, new GUIContent ("Exposure", "Exposure adjustment"));			
		} else if (type.enumValueIndex == Tonemapping.TonemapperType.OptimizedHejiDawson) { 	
    		EditorGUILayout.PropertyField (exposureAdjustment, new GUIContent ("Exposure", "Exposure adjustment"));			
		} else if (type.enumValueIndex == Tonemapping.TonemapperType.AdaptiveReinhard) {	
    		EditorGUILayout.PropertyField (middleGrey, new GUIContent ("Middle grey", "Middle grey defines the average luminance thus brightening or darkening the entire image."));	
    		EditorGUILayout.PropertyField (white, new GUIContent ("White", "Smallest luminance value that will be mapped to white"));	
    		EditorGUILayout.PropertyField (adaptionSpeed, new GUIContent ("Adaption Speed", "Speed modifier for the automatic adaption"));	
    		EditorGUILayout.PropertyField (adaptiveTextureSize, new GUIContent ("Texture size", "Defines the amount of downsamples needed."));		    				
		}
    	
    	serObj.ApplyModifiedProperties();
    }
}
