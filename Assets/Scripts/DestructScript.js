#pragma strict

function Start () {}

function Update () {}

function OnCollisionEnter(collision : Collision) {
	if (collision.collider.tag.IndexOf("towna") != -1) {
		Debug.Log("Arrived at Town A!");
	}
	else if (collision.collider.tag.IndexOf("townb") != -1) {
		Debug.Log("Arrived at Town B!");
	}
	else if (collision.collider.tag.IndexOf("box") != -1) {
		Debug.Log("Box Collision!");
	}
}