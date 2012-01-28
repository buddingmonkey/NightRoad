#pragma strict

public var maxWheelTorque:float = 20.0f;
public var maxLeftWheelAngle:float = -30.0f;
public var maxRightWheelAngle:float = 30.0f;
public var brakeTorque:float = 1.0f;
public var accelleration:float = 1.0f;

public var wheelSmoothTime:float = 0.5f;
private var currentSmoothTime:float;

function Start () {}

function Update () {
	//
	// Forward
	//

	var newTorque:float = 0;

	// Move forward
	if (Input.GetAxis("Vertical") > 0) {
		newTorque = maxWheelTorque;
	}

	GetComponent.<WheelCollider>().motorTorque = newTorque;

	//Debug.Log("Wheel Torque: " + GetComponent.<WheelCollider>().motorTorque);

	//
	// Left
	//

	var newSteerAngle:float;

	// Steer left
	if (Input.GetAxis("Horizontal") < 0) {
		newSteerAngle = Mathf.SmoothStep(maxLeftWheelAngle, 0, currentSmoothTime/wheelSmoothTime);
	}
	// Steer right
	else if (Input.GetAxis("Horizontal") > 0) {
		newSteerAngle = Mathf.SmoothStep(maxRightWheelAngle, 0, currentSmoothTime/wheelSmoothTime);
	}
	// Straighten
	else {
		currentSmoothTime += Time.deltaTime;
		newSteerAngle = Mathf.SmoothStep(0, maxLeftWheelAngle, currentSmoothTime/wheelSmoothTime);
	}

	GetComponent.<WheelCollider>().steerAngle = newSteerAngle;
	//Debug.Log("Wheel Steer Angle: " + GetComponent.<WheelCollider>().steerAngle);

	// Finish straightening
	if (newSteerAngle < 0.001f) {
		currentSmoothTime = 0;
	}
}