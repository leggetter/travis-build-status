var PUSHER_CHANNEL_NAME_TMPL = '{{repo}}-builds';

function PusherUpdater(repoOwner, repoName, appKey, updateCallback, options) {
  options = options || {};
  
	this._repoOwner = repoOwner;
  this._repoName = repoName;
  this._updateCb = updateCallback;
  
	// Pusher setup
	if(options.debug !== null && options.debug !== 'false') {    
    Pusher.log = function(msg) {
      console.log(msg);
    };
  }
	
  // TODO: check instances and use shared instance if:
  // 1. the key matches
  // 2. the options are the same
  var pusher = new Pusher(appKey, options);
  var channelName = PUSHER_CHANNEL_NAME_TMPL.replace('{{repo}}', this._repoName);
  var buildChannel = pusher.subscribe(channelName);
  var updateHandler = this.handleActivity.bind(this);
  
  buildChannel.bind('Pending', updateHandler);
  buildChannel.bind('Passed', updateHandler);
  buildChannel.bind('Fixed', updateHandler);
  buildChannel.bind('Broken', updateHandler);
  buildChannel.bind('Failed', updateHandler);
  buildChannel.bind('Still Failing', updateHandler);
};

/**
 * Parse activity data from WebHook payload
 */
PusherUpdater.prototype.handleActivity = function(data) {
  var activity = {
    build_url: data.build_url,
    onwer: this._repoOwner,
    repo: this._repoName,
    sha: data.commit,
    author_name: data.author_name,
    committed_at: data.committed_at
  };
  this._updateCb(activity);
};