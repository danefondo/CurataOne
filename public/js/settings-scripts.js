 $(document).ready(function () { 

    let fonts = [
      'Ubuntu',
      'Lobster',
      'Open Sans',
      'Roboto',
      'Raleway',
      'Roboto Slab',
      'Varela Round',
      'Nunito'
    ];

    let googlefontslink = 'https://fonts.googleapis.com/css?family=';

    for (var i = 0; i < fonts.length; i++) {
      
      let font = fonts[i].split(' ').join('+');

      if ( i == 0) {
        googlefontslink += font;
      } else {
        googlefontslink  += '|' + font;
      }

    }

    function setfont (name) {
      let family = name + ', sans-serif';
      return family
    }

    $('.fontSelectGroup').on('change', function() {
      let settingGroup = $(this).closest('.settingGroup');
      let fontTest = settingGroup.find('.fontTest');
      fontTest.css("font-family", setfont(this.value));
      console.log(this.value);
    });

    // add google fonts to header
    let googlefonts = $("<link>");
    googlefonts.attr("rel", "stylesheet");
    googlefonts.attr("href", googlefontslink);

    $('head').append(googlefonts);


    //
    // Dear reader, it's actually very easy to initialize MiniColors. For example:
    //
    //  $(selector).minicolors();
    //
    // The way I've done it below is just for the demo, so don't get confused
    // by it. Also, data- attributes aren't supported at this time. Again,
    // they're only used for the purposes of this demo.
    //

    /*

    {
      control: $(this).attr('data-control') || 'hue',
      defaultValue: $(this).attr('data-defaultValue') || '',
      format: $(this).attr('data-format') || 'hex',
      keywords: $(this).attr('data-keywords') || '',
      inline: $(this).attr('data-inline') === 'true',
      letterCase: $(this).attr('data-letterCase') || 'lowercase',
      opacity: $(this).attr('data-opacity'),
      position: $(this).attr('data-position') || 'bottom',
      swatches: $(this).attr('data-swatches') ? $(this).attr('data-swatches').split('|') : [],
      change: function(hex, opacity) {
        var log;
        try {
          log = hex ? hex : 'transparent';
          if( opacity ) log += ', ' + opacity;
          console.log(log);
        } catch(e) {}
      },
      theme: 'default'
    }*/
    $('.custom').spectrum({
      color: "#f00",
      preferredFormat: "hex",
      showInput: true
    });

  function LightenDarkenColor(col, amt) {
    
      var usePound = false;
    
      if (col[0] == "#") {
          col = col.slice(1);
          usePound = true;
      }
   
      var num = parseInt(col,16);
   
      var r = (num >> 16) + amt;
   
      if (r > 255) r = 255;
      else if  (r < 0) r = 0;
   
      var b = ((num >> 8) & 0x00FF) + amt;
   
      if (b > 255) b = 255;
      else if  (b < 0) b = 0;
   
      var g = (num & 0x0000FF) + amt;
   
      if (g > 255) g = 255;
      else if (g < 0) g = 0;
   
      return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
    
  }

  function rgb2hex(rgb){
   rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
   return (rgb && rgb.length === 4) ? "#" +
    ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
    ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
    ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
  }

  $(".sp-replacer").on('mouseover', function(){
    let backColor = $(this).find('.sp-preview-inner').css('background-color');
    console.log("MyColor: ", backColor);
    let hexBackColor = rgb2hex(backColor);
    console.log("Hex: ", hexBackColor);
    let newColor = LightenDarkenColor(hexBackColor, 160); 
    console.log("newColor: ", newColor);
    $(this).css("background-color", newColor);
  });

  $(".sp-replacer").on('mouseout', function(){
    $(this).css("background-color", "transparent");
  });

// (function () {
//     var blue10, blueDark, count, green10, greenDark, purple10, purpleDark, red10, redDark, resetAllSubs;
//     count = 0;
//     // Colors
//     blue10 = "rgba(0, 168, 255, .1)";
//     red10 = "rgba(255, 96, 95, .1)";
//     green10 = "rgba(150, 209, 0, .1)";
//     purple10 = "rgba(208, 102, 250, .1)";
//     blueDark = "rgba(0, 94, 142, 1)";
//     redDark = "rgba(155, 3, 0, 1)";
//     greenDark = "rgba(74, 103, 0, 1)";
//     purpleDark = "rgba(110, 49, 134, 1)";
//     $(".blue").on("mouseover", function () {
//       resetAllSubs();
//       $(".blueSub").css({
//         "opacity": "1",
//         "transition-delay": "0s" });

//     });
//     $(".red").on("mouseover", function () {
//       resetAllSubs();
//       $(".redSub").css({
//         "opacity": "1",
//         "transition-delay": "0s" });

//     });
//     $(".green").on("mouseover", function () {
//       resetAllSubs();
//       $(".greenSub").css({
//         "opacity": "1",
//         "transition-delay": "0s" });

//     });
//     $(".purple").on("mouseover", function () {
//       resetAllSubs();
//       $(".purpleSub").css({
//         "opacity": "1",
//         "transition-delay": "0s" });

//     });
//     return resetAllSubs = function () {
//       $(".blueSub").css({
//         "opacity": "0",
//         "transition-delay": "0s" });

//       $(".redSub").css({
//         "opacity": "0",
//         "transition-delay": "0s" });

//       $(".greenSub").css({
//         "opacity": "0",
//         "transition-delay": "0s" });

//       return $(".purpleSub").css({
//         "opacity": "0",
//         "transition-delay": "0s" });

//     };
// }).call(this);

// //# sourceURL=coffeescript



 })