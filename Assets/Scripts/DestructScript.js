#pragma strict

//
// DestructScript - Andrew Pennebaker
//
// - Reacts to physical and logical collision.
//
// Drag and Drop this script onto the car.
//

public var townRotations:Hashtable = {
	"towna" : Quaternion(0.0f, 0.0f, 0.0f, 0.0f),
	"townb" : Quaternion(0.0f, 180.0f, 0.0f, 0.0f)
};

private var fromTown:String;
private var goalTown:String;

function Start () {
	respawn("towna", "townb");
}

//
// Spawn car at origin.
// Set goal at dest.
//
function respawn(origin:String, dest:String) {
	fromTown = origin;
	goalTown = dest;

	//
	// Reset car position
	//

	this.transform.position = GameObject.FindGameObjectWithTag(fromTown).transform.position;

	//
	// Reset car orientation
	//

	this.transform.rotation = townRotations[fromTown];
}

function OnTriggerEnter(collision:Collider) {
	if (collision.collider.tag.Equals(goalTown)) {
		Debug.Log("Arrived at " + goalTown);

		respawn(goalTown, fromTown);
	}
}

function OnCollisionEnter(collision:Collision) {
	if (collision.collider.tag.IndexOf("box") != -1) {
		Debug.Log("Box Collision!");

		respawn(fromTown, goalTown);
	}
}