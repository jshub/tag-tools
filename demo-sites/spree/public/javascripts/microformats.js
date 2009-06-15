/**
 * Provide a visual rendering of the microformats in the page.
 * 
 * @author <a href="mailto:fianno@jshub.org">Fiann O'Hagan</a>
 */
(function() {
  $(document).ready(function() {
    $('.hpage, .hauthentication, .hpurchase').each(function() {
	  // with syntax highlighter
      var html = $(this).html().replace(/\n\s*\n/g, '\n');
	  $(this).after('<textarea name="code" class="html" cols="60" rows="1">'  
	    + '<div class="' + $(this).attr('className') + '">\n' 
		+ html + '\n</div></textarea>');
	});
    dp.SyntaxHighlighter.HighlightAll('code');
    $('.dp-highlighter .attribute').each(function() {
      if ($(this).text() === 'class') {
        $(this).css('backgroundColor', '#ff8');
        $(this).next().css('backgroundColor', '#ff8');
        $(this).next().next().css('backgroundColor', '#ff8');
      }
      else if ($(this).text() === 'rel') {
        $(this).css('backgroundColor', '#ff8');
        $(this).next().css('backgroundColor', '#ff8');
        $(this).next().next().css('backgroundColor', '#ff8');
        $(this).prev().css('backgroundColor', '#ff8');
        $(this).prev().prev().css('backgroundColor', '#ff8');
        $(this).prev().prev().prev().css('backgroundColor', '#ff8');
        $(this).prev().prev().prev().prev().css('backgroundColor', '#ff8');
      }
    });

    $('#jshub li').each(function() {
	  // with titles
      var html = $(this).html().replace(/[\n\s]+/g, ' ');
	  $(this).attr('title', html);
    });
  });

})();