( function( currentScript ) {

//var ServiceDependencies = {
//	pusher: Pusher,
//	travis: Travis
//};
	
var importDoc = currentScript.ownerDocument;

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
 
  Object.defineProperty(TravisBuildStatusElement, "debug", {
  get: function() {
    return this.getAttribute('debug');
  }
 });

TravisBuildStatusElement.createdCallback = function() {    
  if(!this.repoOwner) {
    throw new Error('A "repo-owner" attribute must be provided');
  }
  
  if(!this.repoName) {
    throw new Error('A "repo-name" attribute must be provided');
  }
  
  var cluster = this.getAttribute('pusher-cluster');
  
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
  
  var travis = new TravisAPI(this.repoOwner, this.repoName);
  travis.getPreviousActivity(this.showActivity.bind(this));
  
  if(this.pusherAppKey) {
    var pusherUpdater = new PusherUpdater(this.repoOwner,
                                          this.repoName, 
                                          this.pusherAppKey, 
                                          this.showActivity.bind(this), 
                                          {
                                            debug: this.debug,
                                            cluser: cluster
                                          });
  }
};

TravisBuildStatusElement.showActivity = function(data) {
  if(this.debug) { console.log(data); }
  
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