let db = null
let isDbReady = false

const SQL_CREATE_TABLE_PICTURE = 'CREATE TABLE IF NOT EXISTS `picture` (`pictureId` INTEGER PRIMARY KEY AUTOINCREMENT, `url` TEXT)';
const SQL_INSERT_PICTURE = 'INSERT INTO `picture`(`url`) VALUES (?)';
const SQL_SELECT_PICTURE = 'SELECT * FROM `picture` ORDER BY `pictureId` DESC';
const SQL_DELETE_PICTURE_LOCATION = 'DELETE FROM `picture` WHERE `pictureId` =?'

function getOptions() {
  return {
    quality             : 100, 
    targetWidth         : 1440,  
    destinationType     : Camera.DestinationType.FILE_URI,
    sourceType          : Camera.PictureSourceType.CAMERA,
    encodingType        : Camera.EncodingType.JPEG,
    mediaType           : Camera.MediaType.PICTURE,
    allowEdit           : false,
    correctOrientation  : true
  }
}

function onTakePicture() {
  navigator.camera.getPicture(
    function cameraSuccess(imageUri) { 
      $('#picture').attr('src', imageUri)
      $('#picture').show()
      movePicture(imageUri)
    },                                    // success callback
    function cameraError(error) {
      console.log('CAMERA ERROR', error)
      $('#picture').hide()
    },                                    // error callback
    getOptions()                          // option object
  )
}

function showFSError(title, error) {
  console.log(title, error)
}

function movePicture(imageUri) {
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  
  // // This arrangement can be altered based on how we want the date's format to appear.
  const currentDate = `${day}D-${month}M-${year}Y_${hours}H.${minutes}M.${seconds}S`;

  window.resolveLocalFileSystemURL(
    cordova.file.dataDirectory, // <= open DATA directory
    function (dataDirEntry) {
      window.resolveLocalFileSystemURL(
        imageUri,               // <= get reference to image
        function (imageFileEntry) { 
          imageFileEntry.moveTo(
            dataDirEntry, 
            `${currentDate}.jpg`, // <= file name will be dd-mm-yy_hh.mm.ss.jpg
            function (imageNewFileEntry) { 
              alert('Image saved.')
              db.transaction(
                function(tx) {
                  tx.executeSql(
                    SQL_INSERT_PICTURE,
                    [imageNewFileEntry.toURL()], // <-- insert url into the database
                    function(tx, result) { 
                        console.log('Picture saved at: ',imageNewFileEntry.toURL()); 
                    },
                    function (tx, error) { 
                        console.log('Error saving picture', error.message); 
                    }
                  )
                  refreshList()
                }
              )
            }, 
            function (error) { showFSError('Move Error', error) }
          )
        },
        function (error) { showFSError('Open Image File Error', error) }
      )
    },                                  
    function (error) { showFSError('Open Data Dir Error', error) }
  )
}


function refreshList() {
  if(!isDbReady){
      showError('Database not ready. Please try again later')
      return
  }

  db.transaction(
    function(tx) {
        tx.executeSql(
          SQL_SELECT_PICTURE,
            [],
            function(tx, result) { //clear ui
                $('#listPictureLocation').empty()
                for(let index=0; index < result.rows.length; index++){
                    let h6_fileLocation =  $('<h6></h6>').addClass('card-subtitle mb-2 text-body-secondary').text(`File Location: ${result.rows.item(index).url}`)
                    let divBodyLocation = $('<div></div>').addClass('card-body').append(h6_fileLocation)
                    let divCardLocation =  $('<h6></h6>').attr('data-id', result.rows.item(index).pictureId).addClass('card').append(divBodyLocation).css('margin-bottom', '1rem')
                      .on('click', function(){
                          let picture_id = $(this).attr('data-id')
                          navigator.notification.confirm(
                              result.rows.item(index).url, // message
                              function(buttonIndex){
                                  if(buttonIndex===1){
                                      deletePictureLocation(picture_id)
                                  }  
                              }, 
                              'Do you want to delete', // title
                              ['Delete','Cancel']    // buttonLabels
                          )
                      })
                    $('#listPictureLocation').append(divCardLocation)
                }
            },
            function(tx, error) { showError('Failed to retrieved data.') } 
        )
    }
  )
}

function deletePictureLocation(picture_id) {
  if (!isDbReady) {
      showError('Database not ready. Please try again later')
      return
  }

  db.transaction(
      function(tx) {
          tx.executeSql(
            SQL_DELETE_PICTURE_LOCATION,
              [picture_id],
              function(tx, result) { //delete trip by id
                  refreshList()
              }, 
              function(tx, error) { showError('Failed to delete trip.') } 
          )
      }
  )
}

function onBackClicked() {
  window.location.href = 'index.html';
}

document.body.style.overflow = 'visible';
document.addEventListener(
  'deviceready',
  function () {
    console.log('Device is ready');
    Zepto(function ($) {
      $('#button-takePicture').on('click', onTakePicture);
      $('#button-back').on('click', onBackClicked);

      db = window.sqlitePlugin.openDatabase(
        { 'name':'trip.db', 'location':'default' },
        function (database) { //SUCCESS CALLBACK
             db = database
             db.transaction(
                 function(tx) {
                     tx.executeSql(  
                      SQL_CREATE_TABLE_PICTURE,
                         [],
                         function(tx, result) { 
                         isDbReady = true
                         console.log('SQL_CREATE_TABLE_PICTURE', 'OK')
                         refreshList()
                         }, //SUCCESS CALLBACK
                         function(tx, error) { 
                         isDbReady = false 
                         console.log('SQL_CREATE_TABLE_PICTURE', error.message)
                         }  //ERROR CALLBACK
                     )
                 },
                 function(error) { isDbReady = false } //ERROR CALLBACK (DB)
             )
        }
     )
    });
  },
  false
);