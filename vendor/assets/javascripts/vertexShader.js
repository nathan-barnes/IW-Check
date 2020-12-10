var VertexShader = (function () {
    function VertexShader() {
    }
    VertexShader.code = "\n\tprecision mediump float;\n\tprecision mediump int;\n\tuniform mat4 modelViewMatrix; // optional\n\tuniform mat4 projectionMatrix; // optional\n\tuniform float xcount;\n\tuniform float ycount;\n\tattribute vec3 position;\n\tattribute vec2 uv;\n\tattribute vec2 center;\n\tattribute float perforation;\n\tvarying vec3 vPosition;\n\tvarying vec2 vUV;\n\tvoid main(){\n\t\tvPosition = position;\n\t\tvUV = vec2(uv);\n\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\t}\n";
    return VertexShader;
}());