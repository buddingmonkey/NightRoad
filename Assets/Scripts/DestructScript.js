#pragma strict

//
// DestructScript - Andrew Pennebaker
//
// - Reacts to physical and logical collision.
// - Reacts to leaving the safezone.
//
// Drag and Drop this script onto the truck.
// Truck should be tagged "truck".
//

private var origin:String;
private var goal:String;

function Start () {
	origin = "towna";
	goal = "townb";
	respawn();
}

function respawn() {
	respawnNext(origin, goal);
}

//
// Spawn truck at origin, facing out towards goal.
//
function respawnNext(origin:String, goal:String) {
	this.transform.position = GameObject.FindGameObjectWithTag(origin).transform.position;
	this.transform.rotation = GameObject.FindGameObjectWithTag(origin).transform.rotation;

	Debug.Log("Drive to " + goal + "!");
}

function OnTriggerEnter(collision:Collider) {
	if (collision.collider.tag.Equals(goal)) {
		Debug.Log("Arrived at " + goal);

		var newOrigin:String = goal;
		var newGoal:String = origin;

		origin = newOrigin;
		goal = newGoal;

		Debug.Log("Drive to " + goal + "!");
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