var socket = io.connect();
var chatUsername = null;
var getRandomInt = fabric.util.getRandomInt;
var sessionId = location.toString().split('/')[location.toString().split('/').length - 1];

function pad(str, length) {
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}

function getRandomColor() {
    return (
        pad(getRandomInt(0, 255).toString(16), 2) +
        pad(getRandomInt(0, 255).toString(16), 2) +
        pad(getRandomInt(0, 255).toString(16), 2)
    );
}

function getRandomNum(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomLeftTop() {
    var offset = 50;
    return {
        left: fabric.util.getRandomInt(0 + offset, 700 - offset),
        top: fabric.util.getRandomInt(0 + offset, 500 - offset)
    };
}

function appendMessage( message, username ) {
    $( '.chatContent' ).append( '<div class="messageItem"><p><strong>' + username + '</strong> : ' + message + '</p></div>' );
    $( '.chatContent' ).scrollTop( $( '.chatContent' )[0].scrollHeight );
}

function sendMessage( message, username ) {
    var data = {
        'message': message,
        'sessionId': sessionId
    }
    socket.emit( 'chatMessage', data );
    appendMessage( message, username );
}

function setUsername( username ) {
    if( username.length ) {
        chatUsername = username;
        socket.emit( 'setChatUsername', username );
    }
}

socket.on( 'chatMessage', function( data ) {
    appendMessage( data['message'], data['chatUsername'] );
    $( '.chatPanel' ).addClass( 'panel-danger' );
});

socket.on( 'chatFirstLoad', function( data ) {
    if(data){
        $.each(data, function(index, item){
            appendMessage(item.message, item.username);
        });
    }
});

function sendCanvasJSON( json ) {
     var data = {
        'message': json,
        'sessionId': sessionId
    }
    socket.emit( 'canvasJSON', data );
}

$(function(){
    if( sessionId )
        socket.emit( 'setSessionId', sessionId );
    
    if( !chatUsername ) {
        setUsername( $( '.chatUsername' ).val() );
        
    }

    $( '.chatMessage' ).keypress( function( e ) {
        if( e.which == 13 ) {
            if( $( this ).val().length ) {
                sendMessage( $( this ).val(), chatUsername );
                $( this ).val( '' );
            }
        }
    } );
    
    $( '.chatMessage' ).focus( function() {
        $( '.chatPanel' ).removeClass( 'panel-danger' );
    } );

    var canvas = new fabric.Canvas( 'canvas' );
    canvas.setWidth( 1170 );
    canvas.setHeight( 500 );

    canvas.on( 'object:modified', function( options ) {
        sendCanvasJSON( canvas.toJSON() );
    } );

    socket.on( 'canvasJSON', function(data) {
        canvas.loadFromJSON( data, canvas.renderAll.bind( canvas ) );
    } );
    
    socket.on( 'canvasFirstLoad', function( data ) {
        if( data )
            canvas.loadFromJSON( data, canvas.renderAll.bind( canvas ) );
    });

    $( '.exportImage' ).click( function() {
        window.open( canvas.toDataURL( 'png' ) );
    } );

    $( '.exportSVG' ).click( function() {
        window.open( 'data:image/svg+xml;utf8,' + encodeURIComponent( canvas.toSVG() ) );
    } );

    $( '.exportJSON' ).click( function() {
        $( '.jsonTextarea' ).val( JSON.stringify( canvas.toJSON() ) );
    } );

    $( '.clearCanvas' ).click( function() {
        canvas.clear();
    } );

    $( '.addRectangle' ).click( function() {
        var coord = getRandomLeftTop();

        canvas.add( new fabric.Rect( {
            left: coord.left,
            top: coord.top,
            fill: $( '.setShapeColor' ).val() ? $( '.setShapeColor' ).val() : '#' + getRandomColor(),
            width: 100,
            height: 100,
            opacity: ( $( '.setShapeOpacity' ).val() ? $( '.setShapeOpacity' ).val() : 100 ) / 100
        } ) );
        
        sendCanvasJSON( canvas.toJSON() );
    } );

    $( '.addCircle' ).click( function() {
        var coord = getRandomLeftTop();

        canvas.add( new fabric.Circle( {
            left: coord.left,
            top: coord.top,
            fill: $( '.setShapeColor' ).val() ? $( '.setShapeColor' ).val() : '#' + getRandomColor(),
            radius: 100,
            opacity: ( $( '.setShapeOpacity' ).val() ? $( '.setShapeOpacity' ).val() : 100 ) / 100
        } ) );
        
        sendCanvasJSON( canvas.toJSON() );
    } );

    $( '.addTriangle' ).click( function() {
        var coord = getRandomLeftTop();

        canvas.add( new fabric.Triangle( {
            left: coord.left,
            top: coord.top,
            fill: $( '.setShapeColor' ).val() ? $( '.setShapeColor' ).val() : '#' + getRandomColor(),
            width: 100,
            height: 100,
            opacity: ( $( '.setShapeOpacity' ).val() ? $( '.setShapeOpacity' ).val() : 100 ) / 100
        } ) );
        
        sendCanvasJSON( canvas.toJSON() );
    } );

    $( '.addLine' ).click( function() {
        var coord = getRandomLeftTop();

        canvas.add( new fabric.Line( [ 50, 100, 200, 200], {
            left: coord.left,
            top: coord.top,
            stroke: $( '.setShapeColor' ).val() ? $( '.setShapeColor' ).val() : '#' + getRandomColor(),
            opacity: ( $( '.setShapeOpacity' ).val() ? $( '.setShapeOpacity' ).val() : 100 ) / 100
        } ) );
        
        sendCanvasJSON( canvas.toJSON() );
    } );

    $( '.addText' ).click( function() {
        if( $( '.textContent' ).val().length )
            var text = $( '.textContent' ).val();
        else
            var text = 'Enter your text...';

        var textSample = new fabric.Text( text, {
            left: getRandomInt(350, 400),
            top: getRandomInt(350, 400),
            fontFamily: $( '.setFontFamily' ).val() ? $( '.setFontFamily' ).val() : 'helvetica',
            fontSize: $( '.setFontSize' ).val() ? $( '.setFontSize' ).val() : 12,
            textAlign: $( '.setTextAlign' ).val() ? $( '.setTextAlign' ).val() : 'left',
            fill: $( '.setTextColor' ).val() ? $( '.setTextColor' ).val() : '#' + getRandomColor(),
            originX: 'left',
            hasRotatingPoint: true,
            centerTransform: true
        } );

        canvas.add( textSample );
        
        sendCanvasJSON( canvas.toJSON() );
    } );

    $( '.clearElement' ).click( function() {
        canvas.remove( canvas.getActiveObject() );
        
        sendCanvasJSON( canvas.toJSON() );
    } );

    $( '.sendBackwards' ).click( function() {
        canvas.sendBackwards( canvas.getActiveObject() );
        
        sendCanvasJSON( canvas.toJSON() );
    } );

    $( '.bringForward' ).click( function() {
        canvas.bringForward( canvas.getActiveObject() );
        
        sendCanvasJSON( canvas.toJSON() );
    } );

    $( '.sendToBack' ).click( function() {
        canvas.sendToBack( canvas.getActiveObject() );
        
        sendCanvasJSON( canvas.toJSON() );
    } );

    $( '.bringToFront' ).click( function() {
        canvas.bringToFront( canvas.getActiveObject() );
        
        sendCanvasJSON( canvas.toJSON() );
    } );

    $( '.enterFreeDrawing' ).click( function() {
        canvas.isDrawingMode = true;

        $( this ).hide();
        $( '.exitFreeDrawing' ).show();
    } );

    $( '.exitFreeDrawing' ).click( function() {
        canvas.isDrawingMode = false;

        $( this ).hide();
        $( '.enterFreeDrawing' ).show();
    } );

    $( '.drawingMode' ).change( function() {
        canvas.freeDrawingBrush = new fabric[$( this ).val() + 'Brush'](canvas);
    } );

    $( '.drawingColor' ).change( function() {
        canvas.freeDrawingBrush.color = $( this ).val();
    } );

    $( '.drawingLineWidth' ).change( function() {
        canvas.freeDrawingBrush.width = parseInt( $( this ).val(), 10 ) || 1;
    } );

    $( '.bgColor' ).change( function() {
        canvas.backgroundColor = $( this ).val();
        canvas.renderAll();
        
        sendCanvasJSON( canvas.toJSON() );
    } );

    function addImage( imageName, left, top ) {
        fabric.Image.fromURL( '/images/' + imageName, function( image ) {
            image.set( {
                left: 0,
                top: 0,
                width: 1170,
                height: 500
            } )
            .setCoords();

            canvas.add( image );
            canvas.sendToBack( image );
        } );
        
        sendCanvasJSON( canvas.toJSON() );
    };

    $( '.addTemplate1' ).click( function() {
        addImage( 'storyboard1.gif', 0, 0 );
    } );

    $( '.addTemplate2' ).click( function() {
        addImage( 'storyboard2.png', 0, 0 );
    } );

    $( '.addTemplate3' ).click( function() {
        addImage( 'storyboard3.png', 0, 0 );
    } );
    
    $( '.textContent' ).change( function() {
        var object = canvas.getActiveObject();
        
        if( object ) {
            object.setText( $( this ).val() );
            canvas.renderAll();
        }
        
        sendCanvasJSON( canvas.toJSON() );
    } );
    
    $( '.setFontFamily' ).change( function() {
        var object = canvas.getActiveObject();
        
        if( object ) {
            object.setFontFamily( $( this ).val() );
            canvas.renderAll();
            
            sendCanvasJSON( canvas.toJSON() );
        }
    } );
    
    $( '.setTextAlign' ).change( function() {
        var object = canvas.getActiveObject();
        
        if( object ) {
            object.setTextAlign( $( this ).val() );
            canvas.renderAll();
            
            sendCanvasJSON( canvas.toJSON() );
        }
    } );
    
    $( '.setFontSize' ).change( function() {
        var object = canvas.getActiveObject();
        
        if( object ) {
            object.setFontSize( $( this ).val() );
            canvas.renderAll();
            
            sendCanvasJSON( canvas.toJSON() );
        }
    } );
    
    $( '.setTextColor' ).change( function() {
        var object = canvas.getActiveObject();
        
        if( object ) {
            object.setFill( $( this ).val() );
            canvas.renderAll();
            
            sendCanvasJSON( canvas.toJSON() );
        }
    } );
    
    $( '.setShapeOpacity' ).change( function() {
        var object = canvas.getActiveObject();
        
        if( object ) {
            object.setOpacity( $( this ).val() / 100 );
            canvas.renderAll();
            
            sendCanvasJSON( canvas.toJSON() );
        }
    } );
    
    $( '.setShapeColor' ).change( function() {
        var object = canvas.getActiveObject();
        
        if( object ) {
            if( object.type == 'line' )
                object.setStroke( $( this ).val() );
            else
                object.setFill( $( this ).val() );
            
            canvas.renderAll();
            
            sendCanvasJSON( canvas.toJSON() );
        }
    } );

    canvas.on( 'object:selected', function( options ) {
        var object = canvas.getActiveObject();
        if (!object) return;
        
        if( object.type == 'text' ) {
            $( '.textContent' ).val( object.getText() );
            $( '.setFontFamily' ).val( object.getFontFamily() );
            $( '.setTextAlign' ).val( object.getTextAlign() );
            $( '.setFontSize' ).val( object.getFontSize() );
            $( '.setTextColor' ).val( object.getFill() );
        } else if( object.type == 'line' ) {
            $( '.setShapeOpacity' ).val( object.getOpacity() * 100 );
            $( '.setShapeColor' ).val( object.getStroke() );
        } else {
            $( '.setShapeOpacity' ).val( object.getOpacity() * 100 );
            $( '.setShapeColor' ).val( object.getFill() );
        }
    } );
    
    $( 'a[href="#storyBoardControls"]' ).click( function() {
        if( $( this ).children( 'span' ).hasClass( 'glyphicon-collapse-up' ) )
            $( this ).children( 'span' ).removeClass( 'glyphicon-collapse-up' );
        else
            $( this ).children( 'span' ).addClass( 'glyphicon-collapse-up' );
    } );
    
    $( '#storyBoardControls' ).on( 'shown.bs.collapse', function () {
        canvas.calcOffset();
        canvas.renderAll();
    });
    
    $( '#storyBoardControls' ).on( 'hidden.bs.collapse', function () {
        canvas.calcOffset();
        canvas.renderAll();
    });
    
    $( 'a[data-toggle="tab"]' ).click( function() {
        if( $( '#storyBoardControls' ).hasClass( 'collapse' ) )
            $( 'a[href="#storyBoardControls"]' ).click();
    } );
});