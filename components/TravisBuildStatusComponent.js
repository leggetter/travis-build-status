( function( currentScript ) {

var PUSHER_CHANNEL_NAME_TMPL = '{{repo}}-builds';

//var ServiceDependencies = {
//	pusher: Pusher,
//	travis: Travis
//};
	
var importDoc = currentScript.ownerDocument;

var pusher,
    buildChannel;

var TravisBuildStatusElement = Object.create(HTMLElement.prototype);

Object.defineProperty(TravisBuildStatusElement, "pusherAppKey", {
  get: function() {
    return this.getAttribute('pusher-app-key');
  }
 });
 
 Object.defineProperty(TravisBuildStatusElement, "repoOwner", {
  get: function() {
    return this.getAttribute('repo-owner');
  }
 });
 
 Object.defineProperty(TravisBuildStatusElement, "repoName", {
  get: function() {
    return this.getAttribute('repo-name');
  }
 });

TravisBuildStatusElement.createdCallback = function() {
	// Get attributes
  if(!this.pusherAppKey) {
    throw new Error('A Pusher application key must be provided via the "pusher-app-key" attribute');
  }
    
  if(!this.repoOwner) {
    throw new Error('A "repo-owner" attribute must be provided');
  }
  
  if(!this.repoName) {
    throw new Error('A "repo-name" attribute must be provided');
  }
  
  var cluster = this.getAttribute('pusher-cluster');
  var debug = this.getAttribute('debug');
  
  this.templateParser = new TemplateParser();
  
	// Element setup
  var containerContent = importDoc.querySelector( '#container' ).content;
  var containerClone = importDoc.importNode( containerContent, true );
  this.containerEl = containerClone.querySelector('.build-status-container');
  
  var html = this.templateParser.parse(this.containerEl.innerHTML, { owner: this.repoOwner, repo: this.repoName });
  this.containerEl.innerHTML = html;
  
  this.shadow = this.createShadowRoot();
  this.shadow.appendChild( containerClone );
  
  this.travisImgEl = this.containerEl.querySelector('#travis_image');
  this.buildActivitiesEl = this.containerEl.querySelector('#build_activity');
  
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
  
  var travis = new TravisAPI(this.repoOwner, this.repoName);
  travis.getPreviousActivity(this.showActivity.bind(this));
};

/**
 * Parse activity data from WebHook payload
 */
TravisBuildStatusElement.handleActivity = function(data) {
  var activity = {
    build_url: data.build_url,
    onwer: this.repoOwner,
    repo: this.repoName,
    sha: data.commit,
    author_name: data.author_name,
    committed_at: data.committed_at
  };
  this.showActivity(activity);
};

TravisBuildStatusElement.showActivity = function(data) {
  console.log(data);
  
  var content = importDoc.getElementById('build_activity').content;
  var activityEl = importDoc.importNode( content, true ).querySelector('.build-activity');
  activityEl.innerHTML = this.templateParser.parse(activityEl.innerHTML, data);
  this.buildActivitiesEl.insertBefore(activityEl, this.buildActivitiesEl.firstChild);
};

TravisBuildStatusElement.updateTravisImage = function() {
  // append time-based query string to force refresh
  var src = this.travisImgEl.getAttribute('src');
  src = src.replace(/\?.*/, '?' + Date.now());
  this.travisImgEl.setAttribute('src', src);
};

document.registerElement('travis-build-status', {
  prototype: TravisBuildStatusElement
});
  
} )( document._currentScript || document.currentScript );