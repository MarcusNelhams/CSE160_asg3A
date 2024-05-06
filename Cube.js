class Cube {
  constructor(matrix = new Matrix4(), color=[1,1,1,1], textureType=-2) {
    this.type = 'cube';
    this.color = color;
    this.matrix = matrix;
    this.textureNum = textureType;
  }

  render() {
    // var xy = this.position;
    var rgba = this.color;
    // var size = this.size;

    // pass texture number
    gl.uniform1i(u_WhichTexture, this.textureNum);

    // Pass color to shader
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // Pass matrix
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // front of cube
    drawTriangle3DUV([0.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 0.0, 0.0], [0,0, 1,1, 1,0]);
    drawTriangle3DUV([0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  1.0, 1.0, 0.0], [0,0, 0,1, 1,1]);

    gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

    // top of Cube
    drawTriangle3DUV([0.0, 1.0, 0.0,  0.0, 1.0, 1.0,  1.0, 1.0, 1.0], [0,0, 0,1, 1,1]);
    drawTriangle3DUV([0.0, 1.0, 0.0,  1.0, 1.0, 1.0,  1.0, 1.0, 0.0], [0,0, 1,1, 1,0]);

    // bottom of Cube
    drawTriangle3DUV([0.0, 0.0, 0.0,  0.0, 0.0, 1.0,  1.0, 0.0, 1.0], [0,1, 0,0, 1,0]);
    drawTriangle3DUV([0.0, 0.0, 0.0,  1.0, 0.0, 1.0,  1.0, 0.0, 0.0], [0,1, 1,0, 1,1]);

    gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);

    // back of Cube
    drawTriangle3DUV([0.0, 0.0, 1.0,  1.0, 1.0, 1.0,  1.0, 0.0, 1.0], [1,0, 0,1, 0,0]);
    drawTriangle3DUV([0.0, 0.0, 1.0,  0.0, 1.0, 1.0,  1.0, 1.0, 1.0], [1,0, 1,1, 0,1]);

    gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
    
    // right side of Cube
    drawTriangle3DUV([1.0, 0.0, 0.0,  1.0, 0.0, 1.0,  1.0, 1.0, 0.0], [0,0, 1,0, 0,1]);
    drawTriangle3DUV([1.0, 0.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 0.0], [1,0, 1,1, 0,1]);

    // left side of Cube
    drawTriangle3DUV([0.0, 0.0, 0.0,  0.0, 0.0, 1.0,  0.0, 1.0, 0.0], [1,0, 0,0, 1,1]);
    drawTriangle3DUV([0.0, 0.0, 1.0,  0.0, 1.0, 1.0,  0.0, 1.0, 0.0], [0,0, 0,1, 1,1]);
  }
}