#pragma strict

<<<<<<< HEAD
//
// FuelScript - Andrew Pennebaker
//
// Manage and penalize late delivery with fuel loss.
//
// Apply this script to the Truck.
//

public var maxFuel:float = 200.0f;
public var minFuel:float = 0.0f;
public var fuelLoss:float = 1.0f;
=======
public var maxFuel:float = 200.0f;
public var minFuel:float = 0.0f;
public var fuelLoss:float = 1.0f;
public var idleFuelLossPercent:float = 0.1f;
>>>>>>> c0542da5ce102d741ebe1aa12dcbffb30e9185c5

private var myFuel:float;

function Start() {
	myFuel = maxFuel;
}

function Update() {
<<<<<<< HEAD
	myFuel -= Time.deltaTime * fuelLoss;

=======
	var deltaFuel = Time.deltaTime * fuelLoss * (Mathf.Abs(Input.GetAxis("Vertical") + idleFuelLossPercent));
	myFuel -= deltaFuel;
	
>>>>>>> c0542da5ce102d741ebe1aa12dcbffb30e9185c5
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