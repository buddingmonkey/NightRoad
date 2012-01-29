using UnityEngine;
using System.Collections;

public class Bomb : MonoBehaviour
{
    //public float additionalDownwardForce = 1000.0f;
    public GameObject explosion;
<<<<<<< HEAD
	public bool collide = false;

    public void Awake()
    {
        //this.rigidbody.AddForce(Vector3.down * additionalDownwardForce);
    }
=======
	private bool collide = false;
>>>>>>> c0542da5ce102d741ebe1aa12dcbffb30e9185c5

    public void OnTriggerStay(Collider other)
	//public void OnCollisionEnter(Collision other)
    {
<<<<<<< HEAD
		if (collide == true){
        	if (explosion)
=======
		if (collide){

			StartCoroutine(MyCoroutine(other));
			
        	/*if (explosion)
>>>>>>> c0542da5ce102d741ebe1aa12dcbffb30e9185c5
        	{
            	Instantiate(explosion, this.transform.position, this.transform.rotation);
        	}

        	if (other.GetComponent<TerrainDeformer>() != null)
        	{
           		other.GetComponent<TerrainDeformer>().DestroyTerrain(this.transform.position,10);
        	}
			var dest = GameObject.FindGameObjectWithTag("Truck");
			Destroy(dest);
   	    	//Destroy(this.gameObject);
<<<<<<< HEAD
			collide = false;
=======
			collide = false;*/
>>>>>>> c0542da5ce102d741ebe1aa12dcbffb30e9185c5
		}
    }
	
	public void OnTriggerEnter(Collider hazard)
	{
		if (hazard.collider.tag.IndexOf("Hazard Collider") != -1){
<<<<<<< HEAD
			collide = true;
		}
	}
=======
			Debug.Log("Touched Hazard");
			collide = true;
		}
	}
	
	IEnumerator MyCoroutine(Collider other)
	{
    	//disable the desired script here
    	yield return new WaitForSeconds(3);
    	
		handleExplosion(other);
	}
	
	public void handleExplosion(Collider other)
	{
		if (explosion)
       	{
           	Instantiate(explosion, this.transform.position, this.transform.rotation);
        }

        if (other.GetComponent<TerrainDeformer>() != null)
        {
           	other.GetComponent<TerrainDeformer>().DestroyTerrain(this.transform.position,10);
        }
		var dest = GameObject.FindGameObjectWithTag("Truck");
		Destroy(dest);
   	    //Destroy(this.gameObject);
		collide = false;
	}
>>>>>>> c0542da5ce102d741ebe1aa12dcbffb30e9185c5
}