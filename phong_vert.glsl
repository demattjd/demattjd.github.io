#version 300 es
layout(location=0) in vec4 vPosition;
layout(location=1) in vec3 vNormal;

uniform mat4 uModel;  // Object to world
uniform mat4 uView;   // World to camera
uniform mat4 uProj;   // Projection matrix

// Output to the fragment shader
out vec3 fNormCam;   // Normal in camera coordinates
out vec3 fPosCam;    // Position in camera coordinates

void main() {
    mat4 mv = uView * uModel;

    // Compute position in camera coordinates
    fPosCam = (mv * vPosition).xyz;

    // Transform normal into camera coordinates.  Note that this is not correct in all cases.  This
    // only transforms the normal correctly when mv contains uniform scalings.  The correct
    // transformation is the inverse transpose of mv.  For now, to keep things simple,
    // we'll just avoid non-uniform scalings.  
    // Note: we add 0 as the 4th component of the normal.
    fNormCam = normalize( (mv * vec4(vNormal,0)).xyz );

    // Convert position to clip coordinates
    gl_Position = uProj * mv * vPosition;
}
