function multiplyMatrices(matrixA, matrixB) {
  var result = [];

  for (var i = 0; i < 4; i++) {
    result[i] = [];
    for (var j = 0; j < 4; j++) {
      var sum = 0;
      for (var k = 0; k < 4; k++) {
        sum += matrixA[i * 4 + k] * matrixB[k * 4 + j];
      }
      result[i][j] = sum;
    }
  }

  // Flatten the result array
  return result.reduce((a, b) => a.concat(b), []);
}
function createIdentityMatrix() {
  return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}
function createScaleMatrix(scale_x, scale_y, scale_z) {
  return new Float32Array([
    scale_x,
    0,
    0,
    0,
    0,
    scale_y,
    0,
    0,
    0,
    0,
    scale_z,
    0,
    0,
    0,
    0,
    1,
  ]);
}

function createTranslationMatrix(x_amount, y_amount, z_amount) {
  return new Float32Array([
    1,
    0,
    0,
    x_amount,
    0,
    1,
    0,
    y_amount,
    0,
    0,
    1,
    z_amount,
    0,
    0,
    0,
    1,
  ]);
}

function createRotationMatrix_Z(radian) {
  return new Float32Array([
    Math.cos(radian),
    -Math.sin(radian),
    0,
    0,
    Math.sin(radian),
    Math.cos(radian),
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
  ]);
}

function createRotationMatrix_X(radian) {
  return new Float32Array([
    1,
    0,
    0,
    0,
    0,
    Math.cos(radian),
    -Math.sin(radian),
    0,
    0,
    Math.sin(radian),
    Math.cos(radian),
    0,
    0,
    0,
    0,
    1,
  ]);
}

function createRotationMatrix_Y(radian) {
  return new Float32Array([
    Math.cos(radian),
    0,
    Math.sin(radian),
    0,
    0,
    1,
    0,
    0,
    -Math.sin(radian),
    0,
    Math.cos(radian),
    0,
    0,
    0,
    0,
    1,
  ]);
}

function getTransposeMatrix(matrix) {
  return new Float32Array([
    matrix[0],
    matrix[4],
    matrix[8],
    matrix[12],
    matrix[1],
    matrix[5],
    matrix[9],
    matrix[13],
    matrix[2],
    matrix[6],
    matrix[10],
    matrix[14],
    matrix[3],
    matrix[7],
    matrix[11],
    matrix[15],
  ]);
}

const vertexShaderSource = `
attribute vec3 position;
attribute vec3 normal; // Normal vector for lighting

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;

uniform vec3 lightDirection;

varying vec3 vNormal;
varying vec3 vLightDirection;

void main() {
    vNormal = vec3(normalMatrix * vec4(normal, 0.0));
    vLightDirection = lightDirection;

    gl_Position = vec4(position, 1.0) * projectionMatrix * modelViewMatrix; 
}

`;

const fragmentShaderSource = `
precision mediump float;

uniform vec3 ambientColor;
uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform float shininess;

varying vec3 vNormal;
varying vec3 vLightDirection;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(vLightDirection);
    
    // Ambient component
    vec3 ambient = ambientColor;

    // Diffuse component
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * diffuseColor;

    // Specular component (view-dependent)
    vec3 viewDir = vec3(0.0, 0.0, 1.0); // Assuming the view direction is along the z-axis
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = spec * specularColor;

    gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
}

`;

/**
 * @WARNING DO NOT CHANGE ANYTHING ABOVE THIS LINE
 */

/**
 *
 * @TASK1 Calculate the model view matrix by using the chatGPT
 */

function getChatGPTModelViewMatrix() {
  const transformationMatrix = new Float32Array([
    // you should paste the response of the chatGPT here:
    0.1767767, -0.1913417, 0.4267767, 0.3, 0.3061862, 0.3535534, -0.1767767,
    -0.25, -0.3535534, 0.3061862, 0.25, 0, 0, 0, 0, 1,
  ]);
  return getTransposeMatrix(transformationMatrix);
}

/**
 *
 * @TASK2 Calculate the model view matrix by using the given
 * transformation methods and required transformation parameters
 * stated in transformation-prompt.txt
 */
function getModelViewMatrix() {
  // calculate the model view matrix by using the transformation
  // methods and return the modelView matrix in this method

  const scaleMatrix = createScaleMatrix(0.5, 0.5, 1); // ratio should be 0.5, 0.5, 1.0

  const thetaX = Math.PI / 4;
  const thetaY = Math.PI / 4;
  const thetaZ = 0;

  const rotationXMatrix = createRotationMatrix_X(thetaX);
  const rotationYMatrix = createRotationMatrix_Y(thetaY);
  const rotationZMatrix = createRotationMatrix_Z(thetaZ);

  const translationMatrix = createTranslationMatrix(0, 0, 0);

  let modelViewMatrix = multiplyMatrices(translationMatrix, rotationZMatrix);
  modelViewMatrix = multiplyMatrices(modelViewMatrix, rotationYMatrix);
  modelViewMatrix = multiplyMatrices(modelViewMatrix, rotationXMatrix);
  modelViewMatrix = multiplyMatrices(modelViewMatrix, scaleMatrix);

  return getTransposeMatrix(modelViewMatrix);
}

/**
 *
 * @TASK3 Ask CHAT-GPT to animate the transformation calculated in
 * task2 infinitely with a period of 10 seconds.
 * First 5 seconds, the cube should transform from its initial
 * position to the target position.
 * The next 5 seconds, the cube should return to its initial position.
 */
function getPeriodicMovement(startTime) {
  // this metdo should return the model view matrix at the given time
  // to get a smooth animation

  // Get the current time in seconds
  const currentTime = (Date.now() - startTime) / 1000;

  // Define the period and calculate the progress
  const period = 10; // 10-second cycle
  const progress = (currentTime % period) / period;

  // Calculate interpolation factor 't'
  let t;
  if (progress < 0.5) {
    t = progress * 2; // First 5 seconds: transitioning to target
  } else {
    t = (1 - progress) * 2; // Next 5 seconds: transitioning back to initial
  }

  // Interpolate scaling from initial (1, 1, 1) to target (0.5, 0.5, 1)
  const initialScale = [1, 1, 1];
  const targetScale = [0.5, 0.5, 1];
  const scale_x = initialScale[0] * (1 - t) + targetScale[0] * t;
  const scale_y = initialScale[1] * (1 - t) + targetScale[1] * t;
  const scale_z = initialScale[2] * (1 - t) + targetScale[2] * t;
  const scaleMatrix = createScaleMatrix(scale_x, scale_y, scale_z);

  // Interpolate rotations from initial (0, 0, 0) to target (Math.PI / 4, Math.PI / 4, 0)
  const initialRotation = [0, 0, 0]; // No rotation initially
  const targetRotation = [Math.PI / 4, Math.PI / 4, 0]; // 45-degree rotations
  const rotationX = initialRotation[0] * (1 - t) + targetRotation[0] * t;
  const rotationY = initialRotation[1] * (1 - t) + targetRotation[1] * t;
  const rotationZ = initialRotation[2] * (1 - t) + targetRotation[2] * t;
  const rotationXMatrix = createRotationMatrix_X(rotationX);
  const rotationYMatrix = createRotationMatrix_Y(rotationY);
  const rotationZMatrix = createRotationMatrix_Z(rotationZ);

  // Interpolate translation from initial (0, 0, 0) to target (0, 0, 0) (no translation in this case)
  const initialTranslation = [0, 0, 0];
  const targetTranslation = [0, 0, 0]; // No translation
  const translate_x =
    initialTranslation[0] * (1 - t) + targetTranslation[0] * t;
  const translate_y =
    initialTranslation[1] * (1 - t) + targetTranslation[1] * t;
  const translate_z =
    initialTranslation[2] * (1 - t) + targetTranslation[2] * t;
  const translationMatrix = createTranslationMatrix(
    translate_x,
    translate_y,
    translate_z
  );

  // Multiply the matrices in the correct order: translation -> rotation -> scaling
  let modelViewMatrix = multiplyMatrices(translationMatrix, rotationZMatrix);
  modelViewMatrix = multiplyMatrices(modelViewMatrix, rotationYMatrix);
  modelViewMatrix = multiplyMatrices(modelViewMatrix, rotationXMatrix);
  modelViewMatrix = multiplyMatrices(modelViewMatrix, scaleMatrix);

  // Return the transposed matrix for WebGL compatibility
  return getTransposeMatrix(modelViewMatrix);
}
