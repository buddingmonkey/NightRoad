#pragma strict

public var maxFuel:float = 200.0f;
public var minFuel:float = 0.0f;
public var fuelLoss:float = 1.0f;

private var myFuel:float;

function Start() {
	myFuel = maxFuel;
}

function Update() {
	myFuel -= Time.deltaTime * fuelLoss;

	Debug.Log("Fuel: " + myFuel);

	if (myFuel < minFuel) {
		Debug.Log("Out of fuel. GAME OVER");
	}
}

function fillUp() {
	myFuel = maxFuel;
}