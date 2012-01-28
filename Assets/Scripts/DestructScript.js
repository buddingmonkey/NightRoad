#pragma strict

//
// DestructScript - Andrew Pennebaker
//
// - Reacts to physical and logical collision.
//
// Drag and Drop this script onto the car.
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
// Spawn car at origin.
//
function respawnNext(origin:String, goal:String) {
	this.transform.position = GameObject.FindGameObjectWithTag(origin).transform.position;
	this.transform.rotation = Quaternion(0.0f, 0.0f, 0.0f, 0.0f);

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
	if (collision.collider.tag.IndexOf("box") != -1) {
		Debug.Log("Box Collision!");

		respawn();
	}
}