#pragma strict

public var maxMotorTorque:float = 40.0f;
public var maxLeftWheelAngle:float = -15.0f;
public var maxRightWheelAngle:float = maxLeftWheelAngle * -1;
public var maxBrakeTorque = 80.0f;

public var wheelSmoothTime:float = 0.5f;
private var currentSmoothTime:float;

function Start () {}

function Update () {
	var collider:WheelCollider = GetComponent.<WheelCollider>();

	//
	// Forward
	//

	var newMotorTorque:float = 0;

	// Accelerate
	if (Input.GetAxis("Vertical") > 0) {
		newMotorTorque = maxMotorTorque;
	}

	collider.motorTorque = newMotorTorque;

	//Debug.Log("Wheel Torque: " + collider.motorTorque);

	//
	// Breaking
	//

	var newBrakeTorque:float = 0;

	// Break
	if (Input.GetAxis("Vertical") < 0) {
		newBrakeTorque = maxBrakeTorque;
	}

	collider.brakeTorque = newBrakeTorque;

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

	collider.steerAngle = newSteerAngle;
	//Debug.Log("Wheel Steer Angle: " + collider.steerAngle);

	// Finish straightening
	if (newSteerAngle < 0.001f) {
		currentSmoothTime = 0;
	}
}