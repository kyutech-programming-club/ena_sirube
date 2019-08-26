const APIKEY = "";
const CLIENTKEY = "";
const ncmb = new NCMB(APIKEY, CLIENTKEY);

var Shop = ncmb.DataStore("Shop");
var DrinkKind = ncmb.DataStore("DrinkKind");

function showDrinks() {
  var drinkList = document.getElementById('drinkCheck');
  DrinkKind.fetchAll()
    .then(function (drinks) {
      // alert(drinks.length);
      for (let drink of drinks) { //大きさよう調整
        drinkList.insertAdjacentHTML('afterbegin', '<h4><label class="checkbox-inline;"><input type="checkbox" name="drink" style="width:20px;height:20px;"  value=' + drink.name + '>' + drink.name + '</label></h4>');
      }
    })
    .catch(function (err) {
      // alert(err);
    });
}

function showDrinksChecked(shop) {
  var drinkList = document.getElementById('drinkCheck');
  var flag = 0;
  DrinkKind.fetchAll()
    .then(function (drinks) {
      for (let drink of drinks) {
        DrinkKind.relatedTo(shop, "drinks")
          .fetchAll()
          .then(function (shopDrinks) {
            for (let sd of shopDrinks) {
              if (sd.name == drink.name) {
                flag = 1;
                break;
              }
            }
          })
          .then(function () {
            if (flag == 0) {
              drinkList.insertAdjacentHTML('afterbegin', '<h4><label class="checkbox-inline;"><input type="checkbox" name="drink" style="width:20px;height:20px;"  value=' + drink.name + '>' + drink.name + '</label></h4>');
            } else {
              drinkList.insertAdjacentHTML('afterbegin', '<h4><label class="checkbox-inline;"><input type="checkbox" name="drink" style="width:20px;height:20px;"  value=' + drink.name + ' checked="checked">' + drink.name + '</label></h4>');
              flag = 0;
            }
          })

      }
    })
    .catch(function (err) {
      // alert(err);
    });
}

function showFilter() {
  var drinkList = document.getElementById('drinkCheck');
  DrinkKind.fetchAll()
    .then(function (drinks) {
      // alert(drinks.length);
      for (let drink of drinks) {
        drinkList.insertAdjacentHTML('afterbegin', '<h4><label class="checkbox-inline"><input type="checkbox" name="drink" value=' + drink.name + ' checked="' + "checked" + '">' + drink.name + '</label></h4>');
      }
    })
    .catch(function (err) {
      // alert(err);
    });
}

function saveDrinks() {
  var memo = document.memo.shopMemo.value;

  if (memo == "") {
    alert("メモが未入力です");
    exit;
  } else {
    Shop.equalTo("memo", memo)
      .fetchAll()
      .then(function (results) {
        if (results.length != 0) {
          alert("すでにそのメモはあります。");
        } else {
          var drinkNames = [];
          var drinkForm = document.drinkList.drink;

          for (var i = 0; i < drinkForm.length; i++) {
            if (drinkForm[i].checked) {
              drinkNames.push(drinkForm[i].value);
            }
          }

          createShop(memo, drinkNames);
        }
      })
      .catch(function (err) {
        // alert(err);
      })
  }
}

function createShop(memo, drinkNames) {

  var drinks = new ncmb.Relation();

  $.when(
    DrinkKind.fetchAll()
      .then(function (drinkKinds) {
        for (let d of drinkKinds) {
          //drinkNames（渡された配列）にd（DB上のドリンクの要素）が含まれているか
          if (drinkNames.indexOf(d.name) >= 0) {
            drinks.add(d);
          }
        }
      })
  ).done(function () {
    var ShopClass = ncmb.DataStore("Shop");
    var shop = new ShopClass();

    var center = gm.map.getCenter();
    var geoPoint = new ncmb.GeoPoint(center.lat(), center.lng());

    if (drinkNames == "") {
      alert("ドリンクが未選択です");
    } else {
      shop.set("memo", memo)
        .set("drinks", drinks)
        .set("point", geoPoint)
        .save()
        .then(function () {
          uploadPicture(shop.objectId);
        })
        .catch(function (err) {
          // alert("createShop : " + err);
        });
    }
  });
}

function createDrinkKind() {
  var name;
  $.when(
    name = document.drinkForm.drinkName.value
  ).done(function () {
    if (name == "") {
      alert("ドリンクが未入力です");
    } else {
      var drinkKind = new DrinkKind();
      // 文字列内の半角の空白を全角の空白に置換
      var newName = name.replace(" ", "　")
      drinkKind.set("name", newName)
        .save()
        .then(function () {
          location.reload();
        })
        .catch(function (err) {
          // alert("createDrinkKind : " + err);
        });
    }
  });
}


function findShop(memo) {
  Shop.equalTo("memo", memo)
    .fetch()
    .then(function (shop) {
      let drinks = [];
      DrinkKind.relatedTo(shop, "drinks")
        .fetchAll()
        .then(function (results) {
          for (let i = 0; i < results.length; i++) {
            let drink = results[i];
            drinks.push(drink.name);
          }
        })
        .then(function () {
          let result = document.getElementById(memo);

          result.innerHTML = "<div class='darkgreen'><h4>" + memo + "</h4>"
            + drinks.join(',') + "</div><br>"
            + "<button onclick='goToShopEdit(" + '"' + shop.objectId + '"' + ");'"
            + "class='btn btn-default' style='float: right;background-color: #3cb371;'>About</button>"
            + '<div id="' + shop.objectId + 'Image"></div>';
          ncmb.File.equalTo("fileName", shop.objectId + ".png")
            .fetchAll()
            .then(function (files) {
              if (files.length > 0) {
                ncmb.File.download(encodeURI(files[0].fileName), "blob")
                  .then(function (blob) {
                    let reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onload = function () {
                      let target = document.getElementById(shop.objectId + "Image");
                      target.insertAdjacentHTML('beforebegin',
                        '<img style="width:30%;height:30%;"'
                        + 'src="' + reader.result + '">');
                    }
                  })
                  .catch(function (err) {
                    // alert(err);
                  });
              }
            })
        })
    });
}

// function findShop(memo) {
//   Shop.equalTo("memo", memo)
//     .fetch()
//     .then(function (shop) {
//       var drinks = [];
//       DrinkKind.relatedTo(shop, "drinks")
//         .fetchAll()
//         .then(function (results) {
//           for (var i = 0; i < results.length; i++) {
//             var drink = results[i];
//             drinks.push(drink.name);
//           }
//           let result = document.getElementById(memo);
//           result.innerHTML = "<h4>" + memo + "</h4>" + drinks.join(',') + "<br>" + "<button onclick='goToShopEdit(" + '"' + shop.objectId + '"' + ");'class='btn btn-default' style='float: right;background-color: #3cb371;'>Edit</button>";

//         })
//         .catch(function (err) {
//           alert("Find shop 2 : " + err);
//         });
//     })
//     .catch(function (err) {
//       alert("Find shop 1 : " + err);
//     });

// }

function goToShopEdit(objectId) {
  location.href = "shop_edit.html?objectId=" + encodeURIComponent(objectId);
}

function showShopDetail(objectId) {
  var memoTextField = document.getElementById("memoText");
  Shop.equalTo("objectId", objectId)
    .fetch()
    .then(function (shop) {
      $.when(
        memoTextField.innerHTML = '<input type="Text" name="shopMemo" value="' + shop.memo + '">' + '<input type="hidden" name="shopId" value="' + shop.objectId + '">'
      ).done(function () {
        gm.setInitialPositionForShopEdit(shop);
        gm.getShops();
        showShopDetailImage(shop);
        showDrinksChecked(shop);
      })
    })
    .catch(function (err) {
      // alert(err);
    });
}

function showShopDetailImage(shop) {
  ncmb.File.equalTo("fileName", shop.objectId + ".png")
    .fetchAll()
    .then(function (files) {
      if (files.length > 0) {
        ncmb.File.download(encodeURI(files[0].fileName), "blob")
          .then(function (blob) {
            let reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onload = function () {
              let target = document.getElementById("preImageArea");
              target.innerHTML = '<img id="preImage" style="width:100%;"' + 'src="' + reader.result + '">';
            }
          })
          .catch(function (err) {
            // alert(err);
          });
      }
    })
    .catch(function (err) {
      // alert(err);
    });

}

function updateDrinks() {
  var memo = document.memo.shopMemo.value;
  var shopId = document.memo.shopId.value;

  if (memo == "") {
    alert("メモが未入力です");
    exit;
  } else {
    Shop.equalTo("memo", memo)
      .fetchAll()
      .then(function (results) {
        if (results.length != 0 && results[0].objectId != shopId) {
          alert("すでにそのメモはあります。");
        } else {
          var drinkNames = [];
          var drinkForm = document.drinkList.drink;

          for (var i = 0; i < drinkForm.length; i++) {
            if (drinkForm[i].checked) {
              drinkNames.push(drinkForm[i].value);
            }
          }
          updateShop(memo, drinkNames, shopId);
        }
      })
      .catch(function (err) {
        // alert(err);
      })
  }
}

function updateShop(memo, drinkNames, shopId) {
  var drinks = new ncmb.Relation();

  $.when(
    DrinkKind.fetchAll()
      .then(function (drinkKinds) {
        for (let d of drinkKinds) {
          //drinkNames（渡された配列）にd（DB上のドリンクの要素）が含まれているか
          if (drinkNames.indexOf(d.name) >= 0) {
            drinks.add(d);
          }
        }
      })
  ).done(function () {
    var center = gm.map.getCenter();
    var geoPoint = new ncmb.GeoPoint(center.lat(), center.lng());

    if (drinkNames == "") {
      alert("ドリンクが未選択です");
    } else {
      Shop.equalTo("objectId", shopId)
        .fetch()
        .then(function (oldShop) {
          oldShop.delete()
            .then(function () {
              var newShop = new Shop();
              newShop.set("memo", memo)
                .set("drinks", drinks)
                .set("point", geoPoint)
                .save()
                .then(function () {
                  uploadPicture(newShop.objectId);
                })
                .catch(function (err) {
                  // alert(err);
                });
            })
            .catch(function (err) {
              // alert(err);
            });
        })
        .catch(function (err) {
          // alert(err);
        });
    }
  });
}

function filterDrink() {
  var selectedDrinkNames = [];
  var drinkForm = document.drinkList.drink;

  for (var i = 0; i < drinkForm.length; i++) {
    if (drinkForm[i].checked) {
      selectedDrinkNames.push(drinkForm[i].value);
    }
  }
  // alert(selectedDrinkNames);
  shops = [];
  Shop.fetchAll()
    .then(function (results) {
      for (let s of results) {
        $.when(
          DrinkKind.relatedTo(s, "drinks")
            .fetchAll()
            .then(function (shopOfDrinks) {
              for (let d of shopOfDrinks) {
                if (selectedDrinkNames.indexOf(d.name) != -1) {
                  // alert("d : " + JSON.stringify(d));
                  // alert("s : " + JSON.stringify(s));
                  shops.push({
                    lat: s.point.latitude,
                    lng: s.point.longitude,
                    memo: s.memo
                  });
                  break;
                }
              }
            })
            .catch(function (err) {
              // alert(err);
            })
        ).done(function () {
          if (s == results.slice(-1)[0]) {
            // alert("shops : "+ JSON.stringify(shops));
            gm.addMarkers(shops);
          }
        })
      }
    })
    .catch(function (err) {
      // alert(err);
    });

}


// document.addEventListener("deviceready", onDeviceReady, false);

// function onDeviceReady() {
//   alert("device ready");
// }

function getPicture() {
  // alert("oncamera");
  navigator.camera.getPicture(onSuccess, onFail,
    { quality: 50, destinationType: Camera.DestinationType.DATA_URL });

  //成功した際に呼ばれるコールバック関数
  function onSuccess(imageData) {
    // alert("onsuccess");
    // 画像を表示
    var preImageArea = document.getElementById('preImageArea');
    preImageArea.innerHTML = '<img id="preImage" src="' + "data:image/png;base64," + imageData + '" style="width:100%;">';
    // preimage.src = "data:image/jpeg;base64," + imageData;

  }

  //失敗した場合に呼ばれるコールバック関数
  function onFail(message) {
    // alert('カメラエラーです: ' + message);
  }
}

function uploadPicture(shopId) {
  var encstr = encodeURI(shopId);

  var preimage = document.getElementById('preImage');
  if (preimage) {
    imageData = preimage.src.substr([22,]);
    // alert("secon"+imageData);

    var byteCharacters = toBlob(imageData);
    ncmb.File.upload(encstr + ".png", byteCharacters)
      .then(function () {
        // alert("Successful");
        location.href = "index.html";
      })
      .catch(function (error) {
        // alert(JSON.stringify(error));
      });
  } else {
    location.href = "index.html";
  }

}

function toBlob(base64) {
  var bin = atob(base64.replace(/^.*,/, ''));
  var buffer = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) {
    buffer[i] = bin.charCodeAt(i);
  }
  // Blobを作成
  try {
    var blob = new Blob([buffer.buffer], {
      type: 'image/png'
    });
  } catch (e) {
    return false;
  }
  return blob;
}

function deleteDrink(drinkNames) {
  for(var i = 0;i < drinkNames.length;i++){
    DrinkKind.equalTo("name",drinkNames[i])
      .fetch()
      .then(function(drinkKind){
        drinkKind.delete()
          .then(function(result){
            // alert("delete success : " + result);
          })
          .then(function(){
            location.reload();
          })
          .catch(function(err){
            // alert("delete err : " + err);
          });
      })
      .catch(function(err){
        // alert("fetch err (deletDrink) : " + err);
      });
  }
}

function deleteCheckedDrink(){
  var drinkNames = [];
  var drinkForm = document.drinkList.drink;
  for (var i = 0; i < drinkForm.length; i++) {
    if (drinkForm[i].checked) {
      drinkNames.push(drinkForm[i].value);
    }
  }
  deleteDrink(drinkNames);
}

function visibleFilter(){
  var filter = document.getElementById("drinkFilter");
  if(filter.style.display == "none"){
    filter.style = "display:inline";
  }
  else {
    filter.style = "display:none";
  }
}
