( function( currentScript ) {

var PUSHER_CHANNEL_NAME_TMPL = '{{repo}}-builds';

//var ServiceDependencies = {
//	pusher: Pusher,
//	travis: Travis
//};
	
var importDoc = currentScript.ownerDocument;

var repoOwner,
    repoName;

var pusher,
    buildChannel;

var containerEl,
    travisImgEl,
    buildActivitiesEl;

var TravisBuildStatusElement = Object.create(HTMLElement.prototype);
TravisBuildStatusElement.createdCallback = function() {
	// Get attributes
  var appKey = this.getAttribute('pusher-app-key');
  if(!appKey) {
    throw new Error('A Pusher application key must be provided via the "pusher-app-key" attribute');
  }
  
  repoName = this.getAttribute('repo-name');
  if(!repoName) {
    throw new Error('A "repo-name" attribute must be provided');
  }
  
  repoOwner = this.getAttribute('repo-owner');
  if(!repoOwner) {
    throw new Error('A "repo-owner" attribute must be provided');
  }
  
  var cluster = this.getAttribute('pusher-cluster');
  var debug = this.getAttribute('debug');
  
	// Element setup
  var containerContent = importDoc.querySelector( '#container' ).content;
  var containerClone = importDoc.importNode( containerContent, true );
  containerEl = containerClone.querySelector('.build-status-container');
  
  var html = parseTemplate(containerEl.innerHTML, { owner: repoOwner, repo: repoName });
  containerEl.innerHTML = html;
  
  this.shadow = this.createShadowRoot();
  this.shadow.appendChild( containerClone );
  
  travisImgEl = containerEl.querySelector('#travis_image');
  buildActivitiesEl = containerEl.querySelector('#build_activity');
  
	// Pusher setup
//	if(debug !== null && debug !== 'false') {    
//    Pusher.log = function(msg) {
//      console.log(msg);
//    };
//  }
//	
//  pusher = new Pusher(appKey, {cluster: cluster});
//  var channelName = PUSHER_CHANNEL_NAME_TMPL.replace('{{repo}}', repoName);
//  buildChannel = pusher.subscribe(channelName);
//  
//  buildChannel.bind('Pending', function(data) {
//    updateTravisImage();
//    handleActivity(data);
//  });
//  
//  buildChannel.bind('Passed', function(data) {
//    updateTravisImage();
//    handleActivity(data);
//  });
//  
//  buildChannel.bind('Fixed', function(data) {
//    updateTravisImage();
//    handleActivity(data);
//  });
//  
//  buildChannel.bind('Broken', function(data) {
//    updateTravisImage();
//    handleActivity(data);
//  });
//  
//  buildChannel.bind('Failed', function(data) {
//    updateTravisImage();
//    handleActivity(data);
//  });
//  
//  buildChannel.bind('Still Failing', function(data) {
//    // Was already failing. No need to update image.
//    handleActivity(data);
//  });
  
  var travis = new TravisAPI(repoOwner, repoName);
  travis.getPreviousActivity(showActivity);
};


  
  
  
  // Helper functions
  
  function parseTemplate(templateStr, tokens) {
    var regex;
    for(var token in tokens) {
      console.log(token, tokens[token]);
      regex = new RegExp('{{' + token + '}}', 'g');
      console.log(regex);
      templateStr = templateStr.replace(regex, tokens[token]);
    }
    return templateStr;
  }
  
  /**
   * Parse activity data from WebHook payload
   */
  function handleActivity(data) {
    var activity = {
      build_url: data.build_url,
      onwer: repoOwner,
      repo: repoName,
      sha: data.commit,
      author_name: data.author_name,
      committed_at: data.committed_at
    };
    showActivity(activity);
  }
  
  function showActivity(data) {
    console.log(data);
    
    var content = importDoc.getElementById('build_activity').content;
    var activityEl = importDoc.importNode( content, true ).querySelector('.build-activity');
    activityEl.innerHTML = parseTemplate(activityEl.innerHTML, data);
    buildActivitiesEl.insertBefore(activityEl, buildActivitiesEl.firstChild);
  }
  
  function updateTravisImage() {
    // append time-based query string to force refresh
    var src = travisImgEl.getAttribute('src');
    src = src.replace(/\?.*/, '?' + Date.now());
    travisImgEl.setAttribute('src', src);
  }
  
  document.registerElement('travis-build-status', {
    prototype: TravisBuildStatusElement
  });
  
  } )( document._currentScript || document.currentScript );