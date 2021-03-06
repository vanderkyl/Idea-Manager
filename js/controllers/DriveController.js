app.controller('DriveController', ['$scope', '$sce',
function($scope, $sce) {
  $scope.loginMessage = "Logging In";
  $scope.testMessage = "Load Test Files";
  // Folders
  $scope.folders = [];
  $scope.folderName = "";
  // Files
  $scope.files = [];
  $scope.file = {};
  //TODO Create functionality for a recent file selection

  $scope.addFolder = function(folder) {
    $scope.safeApply(function() {
      $scope.folders.push(getFolder(folder));
    });
  };

  $scope.addFile = function(file) {
    $scope.safeApply(function() {
      $scope.files.push(getFile(file, $sce));
    });
  };

  $scope.openFolder = function(index) {
    var folder = $scope.folders[index];
    var folderId = folder.id;
    $scope.folderName = folder.name;
    $scope.clearFilesAndFolders();
    loadFolder(folderId,
      $scope.loadFiles,
      $scope.getFiles,
      $scope.waitUntilFilesAreLoaded);
  };

  $scope.openFile = function(index) {
    var file = $scope.files[index];
    $scope.safeApply(function(index) {
      $scope.file = file;
    });
    hidePreviousFile();
    loadFile(file);
  };

  $scope.closeFile = function() {
    closeFile($scope.file.id);
  };

  // Add like on file when opened
  $scope.plusOneOnFile = function() {
    saveLike($scope.file);
  };

  // Add like on file button
  $scope.plusOne = function(index) {
    // Keeps this from adding twice
    stopPropogation();
    saveLike($scope.files[index]);
  };

  $scope.download = function(index) {
    // Keeps this from downloading twice.
    stopPropogation();
    $scope.downloadFile($scope.files[index]);
  };

  $scope.downloadFromFile = function() {
    $scope.downloadFile($scope.file);
  };

  $scope.downloadFile = function(file) {
    // Check if file is greater than 25 MB
    if (file.bytes > 26214400) {
        openLinkInNewTab(file.path);
    } else {
        navigateToURL(file.path);
    }
  }

  // Go through the files that were saved from the Google Api Call
  $scope.getFiles = function() {
    console.log("Getting Files");
    if (PREVIOUS_FOLDER.length > 0) {
      $scope.addPreviousButton();
    }
    sortFiles($scope.addFolder, $scope.addFile);
  };

  $scope.goToFilePage = function() {
    navigateToURL("/#/file?id=" + $scope.file.id);
    CURRENT_FILE = $scope.file;
  }

  // Add button to go back to previous folder contents
  $scope.addPreviousButton = function() {
    $scope.safeApply(function() {
      $scope.folders.push(getPreviousButton());
    });
  };

  $scope.loadFiles = function() {
    console.log("Loading files...");
    $scope.getFiles();
    filesReady = false;
  };

  $scope.waitUntilFilesAreLoaded = function() {
    if (filesReady) {
      $scope.loadFiles();
    } else {
      // TODO use a promise instead of a wait loop. This is dangerous
      setTimeout($scope.waitUntilFilesAreLoaded, 500);
    }
  };

  // Clear the arrays that hold the current files and folders
  $scope.clearFilesAndFolders = function() {
    $scope.folders.length = 0;
    $scope.files.length = 0;
    $scope.folders = [];
    $scope.files = [];
    console.log("Cleared previous folders and files.");
    hideElementById("file");
  };

  // Safely wait until the digest is finished before applying the ui change
  $scope.safeApply = function(fn) {
    var phase = this.$root.$$phase;
    if(phase == '$apply' || phase == '$digest') {
      if(fn && (typeof(fn) === 'function')) {
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };

  //TODO remove log in button when reentering
  // If a folder is already open get the files, else log in.
  if (FILE_LIST.length !== 0) {
    $scope.getFiles();
    hideElementById("authorize-div");
  } else {
    displayElementById("authorize-div");
    if (getParameterByName("test") === "true") {
        console.log(getParameterByName("test"));
        displayElementById("loadTestButton");
    } else {
        try {
            checkAuth();
        } catch (err) {
            $scope.loginMessage = "Log In";
            console.log("Authorization failed. Please log in.");
        }
    }
  }
}]);

