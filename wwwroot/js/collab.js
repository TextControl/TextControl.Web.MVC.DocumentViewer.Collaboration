"use strict";

//-------------------------------------------------------------------------------------------------
// Global Fields
//-------------------------------------------------------------------------------------------------
var _updating;
var _connection;

// connect to signalr hub
_connection = new signalR.HubConnectionBuilder().withUrl("/collabHub").build();
_connection.start();

_connection.on("ReceiveAnnotationSync", async function (annotationSync) {

    // set flag to avoid infinite loops
    _updating = true;

    var currentJson = TXDocumentViewer.annotations.export();

    if (currentJson != annotationSync.annotationJson)
        TXDocumentViewer.annotations.load(annotationSync.annotationJson);

    setTimeout(function () {
        _updating = false;
    }, 1000);
    
});

window.addEventListener("documentViewerLoaded", function () {
    TXDocumentViewer.addEventListener("annotationsChanged", updateAnnotations);
});

function updateAnnotations() {

    if (_updating === true)
        return;

    var jsonAnnotations = TXDocumentViewer.annotations.export();

    // create sync object
    var collaborationSyncObject = {
        User: "Test",
        AnnotationJson: jsonAnnotations
    };

    // call signalr hub with sync object
    _connection.invoke("SetAnnotationSync",
        collaborationSyncObject).catch(function (err) {
            return console.error(err.toString());
        }
    );

}