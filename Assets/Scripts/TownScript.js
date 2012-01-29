#pragma strict

//
// TownScript - Andrew Pennebaker
//
// Reacts to hazard collision and safe zone exit by respawning.
//
// Drag and Drop this script onto the truck.
// Truck should be tagged "Truck".
//
// Town sphere A should be tagged "towna".
// Town sphere B should be tagged "townb".
//
// Respawns occur in the center of the last town, rotated facing out of the town sphere.
//

public var cratesPrefab:GameObject;
public var cratePosRelativeToTruck:Vector3 = Vector3(6.9128f, -3.49126f, 1.372f);

private var origin:String;
private var goal:String;

function Start() {
	origin = "towna";
	goal = "townb";

	//respawn();
}

function Update() {
	if (Input.GetAxis("Jump")) {
		respawn();
		GameObject.FindGameObjectWithTag("Truck").SendMessage("penalize");
	}
}

function respawn() {
	respawnNext(origin, goal);
}

function resetFriendly() {
	var truck:GameObject = GameObject.FindGameObjectWithTag("Truck");

	truck.SendMessage("fillUp");

	Instantiate(
		cratesPrefab,
		truck.transform.position + cratePosRelativeToTruck,
		Quaternion(0, 0, 0, 0)
	);

	Debug.Log("Drive to " + goal + "!");
}

//
// Spawn truck at origin, facing out towards goal.
//
function respawnNext(origin:String, goal:String) {
	this.transform.position = GameObject.FindGameObjectWithTag(origin).transform.position;
	this.transform.rotation = GameObject.FindGameObjectWithTag(origin).transform.rotation;

	resetFriendly();
}

function OnTriggerEnter(collision:Collider) {
	if (collision.collider.tag.Equals(goal)) {
		Debug.Log("Arrived at " + goal);

		var newOrigin:String = goal;
		var newGoal:String = origin;

		origin = newOrigin;
		goal = newGoal;

		resetFriendly();
	}
}

function OnCollisionEnter(collision:Collision) {
	if (collision.collider.tag.IndexOf("Hazard Collider") != -1) {
		Debug.Log("Box Collision!");

		respawn();
	}
}

function OnTriggerExit(collision:Collider) {
	if (collision.collider.tag.Equals("safezone")) {
		Debug.Log("Left the safezone!");

		respawn();
	}
}