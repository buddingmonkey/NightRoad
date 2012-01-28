#pragma strict

function Start () {}

function Update () {}

function OnCollisionEnter(collision : Collision) {
	if (collision.collider.tag.IndexOf("box") != -1) {
		// ...

		Debug.Log("Box Collision!");
	}
}