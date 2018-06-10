#version 300 es
precision highp float;

out vec4 fragColor;

// Material Properties
uniform vec3 uEmissive;  // Emitted intensity
uniform vec3 uAmbient;   // Ambient 
uniform vec3 uDiffuse;   // Diffuse reflectivity (Kd)
uniform vec3 uSpecular;  // Specular reflectivity (Ks)
uniform float uShine;    // Specular exponent (f)

// Light properties
uniform vec3 uLightPos;        // Light position (camera coords)
uniform vec3 uLightIntensity;  // Light intensity
uniform vec3 uAmbientLight;    // Intensity of ambient light

// From the vertex shader, interpolated across the triangle
in vec3 fNormCam;   // Normal in camera coordinates
in vec3 fPosCam;    // Position in camera coordinates

void main() {
    // Renormalize (interpolation can change length slightly)
    vec3 n = normalize(fNormCam);

    // Direction towards light (camera coords)
    vec3 lightDir = normalize( (uLightPos - fPosCam).xyz );
    // Cosine of the angle between normal and lightDir
    float lDotN = max( dot( lightDir, n ), 0.0 );
    vec3 diffuse = uDiffuse * lDotN, 
         specular = vec3(0,0,0);
    if( lDotN > 0.0 ) {
        // Direction towards the camera
        vec3 vDir = normalize( -fPosCam );
        // "Halfway" vector
        vec3 h = normalize( lightDir + vDir );
        float hDotN = max( dot(h, n), 0.0 );
        specular = uSpecular * pow(hDotN, uShine);
    }
    
    // Final color
    fragColor = vec4( 
        uEmissive + 
        uAmbientLight * uAmbient + 
        uLightIntensity * (diffuse + specular)
        , 1 );
}