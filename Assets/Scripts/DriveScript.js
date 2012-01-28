#pragma strict

//
// DriveScript - Andrew Pennebaker
//
// - Maps WSAD to car controls.
// - Detects stalling in the world.
//
// Drag and Drop this script onto the front two wheel colliders.
//

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

public var maxStallTime:float = 5.0f;
public var minStallDistance:float = 0.001f;
private var lastPosition:Vector3;
private var stallTime:float = 0.0f;

function Update () {
	var collider:WheelCollider = GetComponent.<WheelCollider>();

	//
	// Trigger Stall
	//
	if (Input.GetAxis("Vertical") != 0 || Input.GetAxis("Horizontal") != 0) {
		var currentPosition = collider.transform.position;

		if ((currentPosition - lastPosition).magnitude < minStallDistance) {
			stallTime += Time.deltaTime;

			if (stallTime > maxStallTime) {
				Debug.Log("Stalled.");
			}
		}
		else {
			lastPosition = currentPosition;
			stallTime = 0.0f;
		}
	}

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