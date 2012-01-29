#pragma strict

public var maxFuel:float = 200.0f;
public var minFuel:float = 0.0f;
public var fuelLoss:float = 1.0f;
public var idleFuelLossPercent:float = 0.1f;

private var myFuel:float;

function Start() {
	myFuel = maxFuel;
}

function Update() {
	var deltaFuel = Time.deltaTime * fuelLoss * (Mathf.Abs(Input.GetAxis("Vertical") + idleFuelLossPercent));
	myFuel -= deltaFuel;
	
	Debug.Log("Fuel: " + myFuel);

	if (myFuel < minFuel) {
		Debug.Log("Out of fuel. GAME OVER");
	}
}

function fillUp() {
	myFuel = maxFuel;
}

function penalize() {
	myFuel = maxFuel * 0.75f;
}