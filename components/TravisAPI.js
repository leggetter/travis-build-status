function TravisAPI(owner, repo) {
  this._owner = owner;
  this._repo = repo;
}

TravisAPI.prototype.getPreviousActivity = function(cb) {
  var url = 'https://api.travis-ci.org/repos/' + this._owner + '/' + this._repo;
  this.travisRequest(url, function(data) {
    console.log(data);
    
    var buildId = data.repo.last_build_id;
    this.getBuildInfo(buildId, cb);
  }.bind(this));
};
  
TravisAPI.prototype.getBuildInfo = function(buildId, cb) {
    console.log('getting build info for', this._owner, this._repo, buildId);
    if(!buildId) return;
    // TODO: deal with failure scenario
    
    var slug = this._owner + '/' + this._repo;
    this.travisRequest("https://api.travis-ci.org/repos/" + slug + '/builds/' + buildId, function(data) {
      console.log(data);
      var commit = data.commit; 
      
      var activity = {
        build_url: 'https://travis-ci.org/' + slug + '/builds/' + buildId,
        owner: this._owner,
        repo: this._repo,
        sha: commit.sha,
        author_name: commit.author_name,
        committed_at: commit.committed_at
      };
      cb(activity);
    }.bind(this));
  };
  
  TravisAPI.prototype.travisRequest = function(url, cb) {
    var req = window.XDomainRequest ? new XDomainRequest() : new XMLHttpRequest();
  
    if(req) {
      req.open("GET", url, true);
      req.onreadystatechange = function() {
        if(req.readyState === 4 ) {
          cb(JSON.parse(req.responseText));
        }
      };
      req.setRequestHeader("Accept", "application/vnd.travis-ci.2+json");
      req.send();
    }
  };