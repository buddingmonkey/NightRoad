#pragma strict

// Forcible limit on car speed
// public var maxRPM:float = 200.0f;

public var maxMotorTorque:float = 20.0f;
public var maxBrakeTorque = 40.0f;
public var maxReverseTorque:float = maxMotorTorque * -1;

private var movingBackward:boolean = false;

public var maxRightWheelAngle:float = 10.0f;
public var maxLeftWheelAngle:float = maxRightWheelAngle * -1;

public var wheelSmoothTime:float = 0.5f;
private var currentSmoothTime:float;

function Start () {}

function Update () {
	var collider:WheelCollider = GetComponent.<WheelCollider>();

	//
	// Accelerating, Breaking, and Reversing
	//

	var newMotorTorque:float = 0.0f;
	var newBrakeTorque:float = 0.0f;

	// Push forward
	if (Input.GetAxis("Vertical") > 0) {
		// Break
		if (movingBackward && collider.rpm > 1) {
			newBrakeTorque = maxBrakeTorque;
		}
		// Accelerate
		else {
			movingBackward = false;

			// Force speed limit
			// if (collider.rpm < maxRPM) {
				newMotorTorque = maxMotorTorque;
			// }
		}
	}
	// Pull backward
	else if (Input.GetAxis("Vertical") < 0) {
		// Break
		if (collider.rpm > 1) {
			newBrakeTorque = maxBrakeTorque;
		}
		// Reverse
		else {
			movingBackward = true;

			// Force speed limit
			// if (collider.rpm < maxRPM) {
				newMotorTorque = maxReverseTorque;
			// }
		}
	}

	//
	// Left and Right steering
	//

	var newSteerAngle:float = collider.steerAngle;

	// Steer left
	if (Input.GetAxis("Horizontal") < 0) {
		newSteerAngle = Mathf.SmoothStep(maxLeftWheelAngle, 0, Time.deltaTime/wheelSmoothTime);
	}
	// Steer right
	else if (Input.GetAxis("Horizontal") > 0) {
		newSteerAngle = Mathf.SmoothStep(maxRightWheelAngle, 0, Time.deltaTime/wheelSmoothTime);
	}

	//
	// Enact
	//

	collider.motorTorque = newMotorTorque;
	collider.brakeTorque = newBrakeTorque;
	collider.steerAngle = newSteerAngle;
}