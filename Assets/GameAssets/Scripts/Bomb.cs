using UnityEngine;
using System.Collections;

public class Bomb : MonoBehaviour
{
    //public float additionalDownwardForce = 1000.0f;
    public GameObject explosion;
	private bool collide = false;

    public void OnTriggerStay(Collider other)
	//public void OnCollisionEnter(Collision other)
    {
		if (collide){

			StartCoroutine(MyCoroutine(other));
			
        	/*if (explosion)
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
			collide = false;*/
		}
    }
	
	public void OnTriggerEnter(Collider hazard)
	{
		if (hazard.collider.tag.IndexOf("Hazard Collider") != -1){
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
}