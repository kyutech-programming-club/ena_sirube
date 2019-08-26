function GoogleMap() {
  this.init();
  // this.setInitialPosition();
}

GoogleMap.prototype = {
  init: function () {
    if (!(this instanceof GoogleMap)) {
      return new GoogleMap();
    }
    this.map = new google.maps.Map(document.getElementById("googlemap"), {
      zoom: 18,
      mapTypeControl: false,
      streetViewControl: false,
      zoomControl: false,
    });
    this.markers = [];
  },

  getShops: function () {
    var self = this;
    // var shop = new Shop();
    var shops = []
    Shop.fetchAll()
      .then(function (results) {
        //  alert(results);
        for (var i = 0; i < results.length; i++) {
          var object = results[i];
          //  alert(object.lat + " - " + object.get("lng"));
          shops.push({
            lat: object.point.latitude,
            lng: object.point.longitude,
            memo: object.memo
          });
        }
        self.addMarkers(shops);
      })
      .catch(function (err) {
        // alert(err);
      });
  },

  setInitialPosition: function () {
    var self = this;
    var defaultPos = new google.maps.LatLng(33.595271490455374, 130.39634211090933); // Hack U会場
    navigator.geolocation.getCurrentPosition(function (pos) {
      // alert("Success to get current position." + pos);
      self.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
      self.addCenterMark();
    }, function (err) {
      // alert("Failue to get current position." + JSON.stringify(err));
      self.map.setCenter(defaultPos);
      self.addCenterMark();
    }, {
        enableHighAccuracy: true,
        timeout: 1000,
        maximumAge: 0
      });
  },

  setInitialPositionForShopEdit: function (shop) {
    var self = this;
    self.map.setCenter(new google.maps.LatLng(shop.point.latitude, shop.point.longitude));
    self.addCenterMark();
  },

  addMarkers: function (shops) {
    let self = this;

    for (let i = 0; i < this.markers.length; ++i) {
      this.markers[i].setMap(null);
    }
    this.markers = [];
    // this.markers.clear();

    for (let i = 0; i < shops.length; ++i) {
      this.markers.push(new google.maps.Marker({
        map: self.map,
        position: new google.maps.LatLng(shops[i].lat, shops[i].lng),
        title: shops[i].memo,
        icon: "can_40.png"
      }));
    }

    for (let i = 0; i < this.markers.length; ++i) {
      this.markers[i].setMap(this.map);
      let infoWindow = new google.maps.InfoWindow({
        content: '<div id="' + this.markers[i].getTitle() + '"></div>'
      });
      google.maps.event.addListener(self.markers[i], 'click', function () {
        infoWindow.open(self.map, self.markers[i]);
        findShop(self.markers[i].getTitle());
      });
      google.maps.event.addListener(self.map, 'click', function () {
        infoWindow.close();
      });
    }
  },

  addCenterMark: function () {
    var self = this;
    var centerMark = new google.maps.Marker({
      map: self.map,
      position: self.map.getCenter(),
      animation: google.maps.Animation.DROP,
      draggable: true
    });
    centerMark.setMap(this.map);
    google.maps.event.addListener(this.map, 'center_changed', function () {
      var pos = self.map.getCenter();
      centerMark.setPosition(pos);
    });
    google.maps.event.addListener(centerMark, 'dragend', function () {
      self.map.panTo(centerMark.position);
    });
  },
};
