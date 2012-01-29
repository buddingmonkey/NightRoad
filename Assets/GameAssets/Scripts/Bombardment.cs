using UnityEngine;
using System.Collections;

public class Bombardment : MonoBehaviour
{
    public GameObject shell;
    public float width;
    public float depth;
    public float rate = 0.5f;

    private float nextLaunch = 0.0f;

    void Update()
    {
        if (Time.time > nextLaunch)
        {
            nextLaunch = Time.time + rate + Random.Range(0,1.25f);
            FireShell();
        }
    }

    void FireShell()
    {
        float randomRight= Random.Range(-width/2.0f,width/2.0f);
        float randomForward = Random.Range(-depth/2.0f,depth/2.0f);

        Instantiate(shell,(this.transform.position + (Vector3.right * randomRight) + (Vector3.forward * randomForward)),this.transform.rotation);
    
    }

    
}