function saveCreationKitModel( filename ){  
    saveOBJ ( CK.scene , filename );
}

/**
 * Original object exporter written by:
 * @author mrdoob / http://mrdoob.com/
 */

THREE.OBJExporter = function () {};

THREE.OBJExporter.prototype = {

	constructor: THREE.OBJExporter,

	parse: function (object) {

		var output = '';

		var indexVertex    = 0;
		var indexVertexUvs = 0;
		var indexNormals   = 0;

		var vertex = new THREE.Vector3();
		var normal = new THREE.Vector3();
		var uv = new THREE.Vector2();

		var i,
		j,
		l,
		m,
		face = [];

		var parseMesh = function (mesh) {

			var nbVertex    = 0;
			var nbNormals   = 0;
			var nbVertexUvs = 0;

			var geometry = mesh.geometry;

			var normalMatrixWorld = new THREE.Matrix3();

			if (geometry instanceof THREE.Geometry) {

				geometry = new THREE.BufferGeometry().setFromObject(mesh);

			}

			if (geometry instanceof THREE.BufferGeometry) {

				var vertices    = geometry.getAttribute('position');
				var normals     = geometry.getAttribute('normal');
				var uvs         = geometry.getAttribute('uv');
				var indices     = geometry.getIndex();
				var skinIndices = geometry.getAttribute('skinIndex');
				var weights     = geometry.getAttribute('skinWeight');
				var morphVector;
				// name of the mesh object
				output += 'o ' + mesh.name + '\n';

				// vertices

				if (vertices !== undefined) {

					for (i = 0, l = vertices.count; i < l; i++, nbVertex++) {
						if (skinIndices == undefined) {

							vertex.x = vertices.getX(i);
							vertex.y = vertices.getY(i);
							vertex.z = vertices.getZ(i);

							//vertex.applyMatrix4(mesh.matrixWorld);
							output += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z + '\n';
						} else {

							vertex.x = vertices.getX(i);
							vertex.y = vertices.getY(i);
							vertex.z = vertices.getZ(i);
							//vertex.applyMatrix4(mesh.matrixWorld);

							skinIndex       = [];
							skinIndex[0]    = skinIndices.getX(i);
							skinIndex[1]    = skinIndices.getY(i);
							skinIndex[2]    = skinIndices.getZ(i);
							skinIndex[3]    = skinIndices.getW(i);

							skinWeight      = [];
							skinWeight[0]   = weights.getX(i);
							skinWeight[1]   = weights.getY(i);
							skinWeight[2]   = weights.getZ(i);
							skinWeight[3]   = weights.getW(i);

							inverses        = [];
							inverses[0]     = mesh.skeleton.boneInverses[skinIndex[0]];
							inverses[1]     = mesh.skeleton.boneInverses[skinIndex[1]];
							inverses[2]     = mesh.skeleton.boneInverses[skinIndex[2]];
							inverses[3]     = mesh.skeleton.boneInverses[skinIndex[3]];

							skinMatrices    = [];
							skinMatrices[0] = mesh.skeleton.bones[skinIndex[0]].matrixWorld;
							skinMatrices[1] = mesh.skeleton.bones[skinIndex[1]].matrixWorld;
							skinMatrices[2] = mesh.skeleton.bones[skinIndex[2]].matrixWorld;
							skinMatrices[3] = mesh.skeleton.bones[skinIndex[3]].matrixWorld;

							var finalVector = new THREE.Vector4();

							if (geometry.morphTargetInfluences !== undefined) {
								var morphAttributes = geometry.morphAttributes.position;
								//console.log("Mesh Name:" + mesh.name);
								morphMatricesX = [];
								morphMatricesY = [];
								morphMatricesZ = [];
								morphMatricesInfluence = [];

								var morphLength = geometry.morphAttributes.position.length;
								//console.log("Morph Length " + morphLength);
								for (var mt = 0; mt < morphLength; mt++) {
									//collect the needed vertex info
									morphMatricesX[mt] = morphAttributes[mt].getX(i);
									morphMatricesY[mt] = morphAttributes[mt].getY(i);
									morphMatricesZ[mt] = morphAttributes[mt].getZ(i);
									morphMatricesInfluence[mt] = mesh.morphTargetInfluences[mt];

								}

							}

							if (geometry.morphTargetInfluences !== undefined) {

								morphVector = new THREE.Vector4(vertex.x, vertex.y, vertex.z);
								var morphLength = geometry.morphAttributes.position.length;
								for (var mt = 0; mt < morphLength; mt++) {
									//not pretty, but it gets the job done
									morphVector.lerp(new THREE.Vector4(morphMatricesX[mt], morphMatricesY[mt], morphMatricesZ[mt], 1), morphMatricesInfluence[mt]);
								}

							}

							for (var k = 0; k < 4; k++) {
								if (geometry.morphTargetInfluences !== undefined) {
									var tempVector = new THREE.Vector4(morphVector.x, morphVector.y, morphVector.z);
								} else {
									var tempVector = new THREE.Vector4(vertex.x, vertex.y, vertex.z);
								}

								tempVector.multiplyScalar(skinWeight[k]);
								//the inverse takes the vector into local bone space
								//which is then transformed to the appropriate world space
								tempVector.applyMatrix4(inverses[k]).applyMatrix4(skinMatrices[k]);
								finalVector.add(tempVector);

							}

							// transform the vertex to export format
							output += 'v ' + finalVector.x + ' ' + finalVector.y + ' ' + finalVector.z + '\n';
						}

					}

				}

				// uvs

				if (uvs !== undefined) {

					for (i = 0, l = uvs.count; i < l; i++, nbVertexUvs++) {

						uv.x = uvs.getX(i);
						uv.y = uvs.getY(i);

						// transform the uv to export format
						output += 'vt ' + uv.x + ' ' + uv.y + '\n';

					}

				}

				// normals

				if (normals !== undefined) {

					normalMatrixWorld.getNormalMatrix(mesh.matrixWorld);

					for (i = 0, l = normals.count; i < l; i++, nbNormals++) {

						normal.x = normals.getX(i);
						normal.y = normals.getY(i);
						normal.z = normals.getZ(i);

						// transfrom the normal to world space
						normal.applyMatrix3(normalMatrixWorld);

						// transform the normal to export format
						output += 'vn ' + normal.x + ' ' + normal.y + ' ' + normal.z + '\n';

					}

				}

				// faces

				if (indices !== null) {

					for (i = 0, l = indices.count; i < l; i += 3) {

						for (m = 0; m < 3; m++) {

							j = indices.getX(i + m) + 1;

							face[m] = (indexVertex + j) + '/' + (uvs ? (indexVertexUvs + j) : '') + '/' + (indexNormals + j);

						}

						// transform the face to export format
						output += 'f ' + face.join(' ') + "\n";

					}

				} else {

					for (i = 0, l = vertices.count; i < l; i += 3) {

						for (m = 0; m < 3; m++) {

							j = i + m + 1;

							face[m] = (indexVertex + j) + '/' + (uvs ? (indexVertexUvs + j) : '') + '/' + (indexNormals + j);

						}

						// transform the face to export format
						output += 'f ' + face.join(' ') + "\n";

					}

				}

			} else {

				console.warn('THREE.OBJExporter.parseMesh(): geometry type unsupported', geometry);

			}

			// update index
			indexVertex    += nbVertex;
			indexVertexUvs += nbVertexUvs;
			indexNormals   += nbNormals;

		};

		var parseLine = function (line) {

			var nbVertex = 0;

			var geometry = line.geometry;
			var type = line.type;

			if (geometry instanceof THREE.Geometry) {

				geometry = new THREE.BufferGeometry().setFromObject(line);

			}

			if (geometry instanceof THREE.BufferGeometry) {

				// shortcuts
				var vertices = geometry.getAttribute('position');
				var indices  = geometry.getIndex();

				// name of the line object
				output += 'o ' + line.name + '\n';

				if (vertices !== undefined) {

					for (i = 0, l = vertices.count; i < l; i++, nbVertex++) {

						vertex.x = vertices.getX(i);
						vertex.y = vertices.getY(i);
						vertex.z = vertices.getZ(i);

						// transfrom the vertex to world space
						vertex.applyMatrix4(line.matrixWorld);

						// transform the vertex to export format
						output += 'v ' + vertex.x + ' ' + vertex.y + ' ' + vertex.z + '\n';

					}

				}

				if (type === 'Line') {

					output += 'l ';

					for (j = 1, l = vertices.count; j <= l; j++) {

						output += (indexVertex + j) + ' ';

					}

					output += '\n';

				}

				if (type === 'LineSegments') {

					for (j = 1, k = j + 1, l = vertices.count; j < l; j += 2, k = j + 1) {

						output += 'l ' + (indexVertex + j) + ' ' + (indexVertex + k) + '\n';

					}

				}

			} else {

				console.warn('THREE.OBJExporter.parseLine(): geometry type unsupported', geometry);

			}

			// update index
			indexVertex += nbVertex;

		};

		object.traverse(function (child) {

			if (child instanceof THREE.SkinnedMesh || child.name == 'base') {

				parseMesh(child);

			}

			if (child instanceof THREE.Line) {

				parseLine(child);

			}

		});

		return output;

	}

};



// Use FileSaver.js 'saveAs' function to save the string
function saveOBJ( scene, name ){  
  var exporter = new THREE.OBJExporter();
  var objString = exporter.parse( scene );
  
  var blob = new Blob([objString], {type: 'text/plain'});
  
  saveAs(blob, name + '.obj');
}

var saveAs = saveAs || (function(view) {
	"use strict";
	// IE <10 is explicitly unsupported
	if (typeof view === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
		return;
	}
	var
		  doc = view.document
		  // only get URL when necessary in case Blob.js hasn't overridden it yet
		, get_URL = function() {
			return view.URL || view.webkitURL || view;
		}
		, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
		, can_use_save_link = "download" in save_link
		, click = function(node) {
			var event = new MouseEvent("click");
			node.dispatchEvent(event);
		}
		, is_safari = /constructor/i.test(view.HTMLElement) || view.safari
		, is_chrome_ios =/CriOS\/[\d]+/.test(navigator.userAgent)
		, throw_outside = function(ex) {
			(view.setImmediate || view.setTimeout)(function() {
				throw ex;
			}, 0);
		}
		, force_saveable_type = "application/octet-stream"
		// the Blob API is fundamentally broken as there is no "downloadfinished" event to subscribe to
		, arbitrary_revoke_timeout = 1000 * 40 // in ms
		, revoke = function(file) {
			var revoker = function() {
				if (typeof file === "string") { // file is an object URL
					get_URL().revokeObjectURL(file);
				} else { // file is a File
					file.remove();
				}
			};
			setTimeout(revoker, arbitrary_revoke_timeout);
		}
		, dispatch = function(filesaver, event_types, event) {
			event_types = [].concat(event_types);
			var i = event_types.length;
			while (i--) {
				var listener = filesaver["on" + event_types[i]];
				if (typeof listener === "function") {
					try {
						listener.call(filesaver, event || filesaver);
					} catch (ex) {
						throw_outside(ex);
					}
				}
			}
		}
		, auto_bom = function(blob) {
			// prepend BOM for UTF-8 XML and text/* types (including HTML)
			// note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
			if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
				return new Blob([String.fromCharCode(0xFEFF), blob], {type: blob.type});
			}
			return blob;
		}
		, FileSaver = function(blob, name, no_auto_bom) {
			if (!no_auto_bom) {
				blob = auto_bom(blob);
			}
			// First try a.download, then web filesystem, then object URLs
			var
				  filesaver = this
				, type = blob.type
				, force = type === force_saveable_type
				, object_url
				, dispatch_all = function() {
					dispatch(filesaver, "writestart progress write writeend".split(" "));
				}
				// on any filesys errors revert to saving with object URLs
				, fs_error = function() {
					if ((is_chrome_ios || (force && is_safari)) && view.FileReader) {
						// Safari doesn't allow downloading of blob urls
						var reader = new FileReader();
						reader.onloadend = function() {
							var url = is_chrome_ios ? reader.result : reader.result.replace(/^data:[^;]*;/, 'data:attachment/file;');
							var popup = view.open(url, '_blank');
							if(!popup) view.location.href = url;
							url=undefined; // release reference before dispatching
							filesaver.readyState = filesaver.DONE;
							dispatch_all();
						};
						reader.readAsDataURL(blob);
						filesaver.readyState = filesaver.INIT;
						return;
					}
					// don't create more object URLs than needed
					if (!object_url) {
						object_url = get_URL().createObjectURL(blob);
					}
					if (force) {
						view.location.href = object_url;
					} else {
						var opened = view.open(object_url, "_blank");
						if (!opened) {
							// Apple does not allow window.open, see https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/WorkingwithWindowsandTabs/WorkingwithWindowsandTabs.html
							view.location.href = object_url;
						}
					}
					filesaver.readyState = filesaver.DONE;
					dispatch_all();
					revoke(object_url);
				}
			;
			filesaver.readyState = filesaver.INIT;

			if (can_use_save_link) {
				object_url = get_URL().createObjectURL(blob);
				setTimeout(function() {
					save_link.href = object_url;
					save_link.download = name;
					click(save_link);
					dispatch_all();
					revoke(object_url);
					filesaver.readyState = filesaver.DONE;
				});
				return;
			}

			fs_error();
		}
		, FS_proto = FileSaver.prototype
		, saveAs = function(blob, name, no_auto_bom) {
			return new FileSaver(blob, name || blob.name || "download", no_auto_bom);
		}
	;
	// IE 10+ (native saveAs)
	if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
		return function(blob, name, no_auto_bom) {
			name = name || blob.name || "download";

			if (!no_auto_bom) {
				blob = auto_bom(blob);
			}
			return navigator.msSaveOrOpenBlob(blob, name);
		};
	}

	FS_proto.abort = function(){};
	FS_proto.readyState = FS_proto.INIT = 0;
	FS_proto.WRITING = 1;
	FS_proto.DONE = 2;

	FS_proto.error =
	FS_proto.onwritestart =
	FS_proto.onprogress =
	FS_proto.onwrite =
	FS_proto.onabort =
	FS_proto.onerror =
	FS_proto.onwriteend =
		null;

	return saveAs;
}(
	   typeof self !== "undefined" && self
	|| typeof window !== "undefined" && window
	|| this.content
));
// `self` is undefined in Firefox for Android content script context
// while `this` is nsIContentFrameMessageManager
// with an attribute `content` that corresponds to the window

if (typeof module !== "undefined" && module.exports) {
  module.exports.saveAs = saveAs;
} else if ((typeof define !== "undefined" && define !== null) && (define.amd !== null)) {
  define("FileSaver.js", function() {
    return saveAs;
  });
}

