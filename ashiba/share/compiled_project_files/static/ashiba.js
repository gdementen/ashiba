//Should probably namespace this
var ashiba = {
  'getDom' : function(){
    var dom = {}; 
    var inputs = $('input, select');
    for(i=0;i<inputs.length;i++){
      var element = inputs[i];
      if(!!element.id){
        dom[element.id] = {};
        var meta = {'nodeName' :element.nodeName,
                    'innerHTML':element.innerHTML};
        dom[element.id]['_meta'] = meta;
        if (element.type === "checkbox"||
            element.type === "radio"){
          dom[element.id]['checked'] = element.checked;
        }else{
          dom[element.id]['value'] = element.value;
        }
      }
    }

    /* This is for manually specifying other DOM object-properties to be
     * visible. */
    /*
    var extras = $('.ashiba_visible, .ashiba-visible');
    for(i=0;i<extras.length;i++){
      if(!!extras[i].id){
        var element = extras[i];
        dom[element.id] = {};
        var properties = element.ashiba.split(' ');
        for(j=0;j<properties.length;j++){
          var property = properties[j];
          if(property){
            dom[element.id][property] = element[property];
          }
        }
      }
    }
    */

    return JSON.stringify(dom);
  },

  'setDom' : function (jsonResponse){
    var domObj = jsonResponse["dom_changes"];
    Object.getOwnPropertyNames(domObj).forEach(function(element_name){
      var element = document.getElementById(element_name);
      Object.getOwnPropertyNames(domObj[element_name]).forEach(function(property){
        console.log("Element name: " + element_name + '\n'
                  + "    Property: " + property + '\n'
                  + "       Value: " + domObj[element_name][property] + '\n'
        );
        if (property != '_meta'){
          element.setAttribute(property, domObj[element_name][property]);
        } else {
          var meta = domObj[element_name]['_meta'];
          if (meta.innerHTML !== undefined){  
            element.innerHTML = meta.innerHTML;
          }
        }
      });
      var nn = element.nodeName.toLowerCase();
      if (!(nn == 'input' || nn == 'select' || nn == 'textarea')
          && element.hasAttribute('onchange')){
        element.onchange();
      }
    });
  },

  'grabAttr' : function (o){
    var att = o.attributes;
    var out = {};
    for (i=0;i<att.length;i++){
      out[att[i].name] = att[i].value;
    }
    return out;
  },

  'eventHandlerFactory' : function (objName, eventName){
    return function(){
      console.log("Received event #" + objName + ":" + eventName);
      $.ajax({
        url: "event/" + objName + "/" + eventName,
        type: 'POST',
        data: ashiba.getDom(),
        dataType: 'json'
      }).done(function(data){
        console.log("AJAX success, setting DOM elements: "
            + JSON.stringify(data));
        ashiba.setDom(data);
      }).fail(function(data){
        debugStr = data.responseText;
        if (debugStr.indexOf('Werkzeug Debugger') >= 0){
          document.body.innerHTML = debugStr;
          console.log("AJAX failure: " +
                      /.*\/\//.exec($('title').last().text()));
        } else {
          alert("AJAX failure: " + debugStr);
          console.log("AJAX failure: " + debugStr);
        }
      });
    };
  }
}

$(document).ready(function(){
  /* Nice-ify sliders */
  $('input[type="range"]').after(function(){
    return ('&nbsp;<output for="' + this.id +'">' +
                    this.value +'</output>');
  }).on('change', function(){
    $('output[for="'+ this.id +'"]').val(this.value);
  });

  /* Bless jQUI elements */
  var uiElements = ['tabs', 'dialog'];
  for (i=0;i<uiElements.length;i++){
    var e = uiElements[i];
    $('.jqui-' + e + ':not(.hide)')[e]();
  }
});
