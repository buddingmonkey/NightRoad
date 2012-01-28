#pragma strict

public var maxWheelTorque:float = 5.0f;
public var brakeTorque:float = 1.0f;
public var accelleration:float = 1.0f;

function Start () {

}

function Update () {
	if (Input.GetAxis ("Vertical")){
		GetComponent.<WheelCollider>().motorTorque = maxWheelTorque;
		Debug.Log("Wheel Torque: " + GetComponent.<WheelCollider>().motorTorque);
	}else{
		GetComponent.<WheelCollider>().motorTorque = 0;
	}
}