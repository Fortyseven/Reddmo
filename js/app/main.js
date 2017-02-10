var RANDOM_SEED = 'bacon';
var LIMIT = 100;
var MAX_TITLE_LENGTH = 50;
var MAX_STYLES = 3;

var zazzle_words = [ "EXCLUSIVE:", "EXCLUSIVE!", "BREAKING:" ];
var month_str = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec' ];
var reddit_url = "";

$( document ).ready( function()
{
    var subreddit = FetchSubredditFromURL();

    if( subreddit == "all" ) {
        subreddit = "";
    }

    // populate custom input text box if not all
    if( subreddit != "" ) {
        $( "#CustomSubredditBox" )
            .val( subreddit );
    }

    // try to get it from localstorage first
    var cached_copy = sessionStorage.getItem( subreddit + '_json' );

    // if we don't have this feed cached, go get it.
    if( !cached_copy ) {
        LoadFreshFeed( subreddit );
    }
    else {
        console.log( "USING CACHED COPY OF " + subreddit );
        cached_copy = JSON.parse( cached_copy );
        RenderPage( subreddit, cached_copy );
    }

    BindControls( subreddit );
    BindSubreddits( subreddit );
});

function BindControls( subreddit )
{
    $( "#CustomSubredditBox" ).keydown( function( e ) {
            if ( e.which == 13 ) {
                window.location.hash = $( "#CustomSubredditBox" ).val();
                window.location.reload();
            }
        } )
        .select();

    $( "#RefreshButton" ).click( function() {
        //sessionStorage.clear
        sessionStorage.removeItem( subreddit + '_json' );
        window.location.reload();
    } );

    $( "#RenderButton" ).click( function()
    {
        //        html2canvas($("#Page" ), {
        //            onrendered: function(canvas) {
        //                document.body.appendChild(canvas);
        //            },
        //            width: 600,
        //            height: 800
        //        })
        alert( "Coming soon! You'll have to just hit Print Screen and paste it into MS Paint, or something, for now.\n\n(And make sure you crop the image. Don't be that guy.)" );
    } );
}

function BindSubreddits( subreddit )
{
    // Get those subreddit buttons working
//    $( "#Header" ).find( "li" ).each( function( index, el )
//    {
//        if ( subreddit == $( el ).html() ) {
//            $( el ).addClass( 'subreddit-selected' );
//        }
//
//        $( el ).click( function( ev )
//        {
//            var el = $( ev.target );
//            //sessionStorage.setItem( "subreddit", el.html() );
//            window.location.hash = el.html();
//            window.location.reload();
//        } );
//    } );
    $("#SubredditDropdown").on("change", function(e) {
        window.location.hash = $(this).val();
        window.location.reload();
    });
}

function RenderHeaderValues( subreddit )
{
    var today = new Date();
    $( "#Date" ).html( month_str[ today.getMonth() ] + ' ' + today.getFullYear() );

    if ( subreddit != "" ) {
        $( "#Subreddit" ).html( "/r/" + subreddit + " Edition" );
    }
}

function FetchGoogleImageForTerm( title )
{
//    console.log( "REVERTING TO GIS SEARCH: ", title );
//
//    $.ajax( {
//                url:           "https://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=" + escape( title ),
//                dataType:      "jsonp",
//                jsonpCallback: "jsonprec",
//                success:       function( data, textStatus ) {
////                                    console.log(data);
////                                   console.log( "GIS RESULT: ", data.responseData.results[ 0 ].url );
//                                   $( "#BackgroundImage" ).css( 'background-image', "url(" + data.responseData.results[ 0 ].url + ")" );
//                               }
//            } );
}

function RenderBackgroundImage( posts )
{
    var result = "";
    var target_post = null;

    for ( var i = 0; i < posts.length; i++ ) {
        var url = posts[ i ].data.url;
        //var thumb = posts[i].data.thumbnail;
        var thumb = null;
        if (posts[i].data.preview) {
            thumb = posts[ i ].data.preview.images[ 0 ].source.url;
        }

        if (thumb) {
//        if (thumb.indexOf(".jpg")>0) {
            result = "url('" + thumb + "')";
            target_post = posts[i].data.preview;
//            if ( (
//                     ( url.indexOf( 'i.imgur.com' ) >= 0 ) ||
//                     ( url.indexOf( 'gfycat.com' ) >= 0) ||
//                     ( url.indexOf( 'i.redd.it' ) >= 0)
//                 )
//                 &&
//                 (
//                     ( url.indexOf( '.jpg' ) >= 0 ) ||
//                     ( url.indexOf( '.jpeg' ) >= 0 ) ||
//                     ( url.indexOf( '.png' ) >= 0 ) ||
//                     ( url.indexOf( '.mp4' ) >= 0 ) ||
//                     ( url.indexOf( '.gif' ) >= 0 )
//                 )
//            )
//            {
//                result = "url(" + url + ")";
//            }
            break;
        }
    }

    // if it's blank, try and use GIS to fetch an image
//    if ( result == "" ) {
//        result = FetchGoogleImageForTerm( posts[ 0 ].data.title );
//    }
    // otherwise, use the URL from the reddit post

    $( "#BackgroundImage" ).css( 'background-image', result );
    console.log("using", result, target_post);

    return result;
}

function LoadFreshFeed( subreddit )
{
    // choose the appropriate source for it
    if ( subreddit == '' ) {
        //reddit_url = "ajax.php?url=reddit.com/.json";
        reddit_url = "https://reddit.com/.json?limit=" + LIMIT + "&jsonp=jsonprec"
    }
    else {
        //reddit_url = "ajax.php?url=reddit.com/r/"+subreddit+"/.json";
        reddit_url = "https://reddit.com/r/" + subreddit + "/.json?limit=" + LIMIT + "&jsonp=jsonprec";
    }

    $.ajax( {
        url: reddit_url,
        dataType: "jsonp",
        jsonpCallback: "jsonprec",
        success: function( data, textStatus )
        {
            console.log( "FETCH FRESH COPY OF " + subreddit );

            try {
                sessionStorage.setItem( subreddit + "_json", JSON.stringify( data ) );
            }
            catch ( err ) {
                if ( err == "QuotaExceededError" ) {
                    console.log( "Out of room; clearing out all local storage" );
                    sessionStorage.clear();
                }
            }

            RenderPage( subreddit, data );
        }
    } );
}

function GetZazzleWord()
{
    return zazzle_words[ Math.floor( Math.random() * zazzle_words.length ) ];
}

function RenderPage( subreddit, subreddit_data )
{
    var posts = subreddit_data.data.children;

    Math.seedrandom( RANDOM_SEED + subreddit );

    RenderHeaderValues( subreddit );

    // load up the first pretty background we find

    RenderBackgroundImage( posts );

    var total_headlines = 0;
    $( ".headline_box" ).each( function( index, el ) {
        $( el ).attr( 'id', 'headline' + index );
        total_headlines++;
    } );

    var max_posts = posts.length;

    if ( max_posts > total_headlines ) {
        max_posts = total_headlines;
    }

    var cur_post = 0;
    var style_counter = Math.floor( Math.random() * ( MAX_STYLES ) );

    for ( var i = 0; i < max_posts; i++, cur_post++ ) {
        // make sure we only pick reasonably sized titles
        if ( posts[ cur_post ] ) {
            while ( posts[ cur_post ].data.title.length > MAX_TITLE_LENGTH ) {
                cur_post++;
                if ( cur_post >= posts.length ) {
                    i = max_posts;
                    break;
                }
            }

            if ( posts[ cur_post ] ) {
                var headline = $( "#headline" + i );
                var title = Cleanse( posts[ cur_post ].data.title );

                if ( title.length >= 22 ) {
                    if ( ( Math.floor( Math.random() * 100 ) ) < 10 ) {
                        title = "<span>" + GetZazzleWord() + "</span> " + title;
                        headline.addClass( 'headline-style1' );
                    }
                }

//                if (word_count(title) == 1) {
//                    headline.addClass( 'headline-size-xlarge' );
//                } else
                    if ( title.length > 45 ) {
                    headline.addClass( 'headline-size-small' );
                }
                else if ( title.length < 8 ) {
                    headline.addClass( 'headline-size-xlarge' );
                }
                else if ( title.length < 22 ) {
                    headline.addClass( 'headline-size-large' );
                }
                else {
                    headline.addClass( 'headline-size-medium' );
                }

                if (word_count(title) <= 2) {
                    if ((Math.random() * 100) < 50 )
                        title = title + "!";
                    else if ((Math.random() * 100) < 50 )
                        title = title + "?";
                }

                // pick a style

                switch ( style_counter % MAX_STYLES ) {
                    case 0:
                        headline.addClass( "headline-style-1" );
                        break;
                    case 1:
                        headline.addClass( "headline-style-2" );
                        break;
                    case 2:
                        headline.addClass( "headline-style-3" );
                        break;
                }

                headline.html( "<a href='" + posts[ cur_post ].data.url + "'>" + title + "</a>" );

                style_counter++;
            }
        }
    }
}

function word_count( str )
{
    return str.split( " " ).length;
}

function FetchSubredditFromURL()
{
    var result = "";

    return document.location.hash.trim().toLowerCase().replace( "#", "" );
    //return result;
}

function Cleanse( str )
{
    var newstr;

    if ( str[ str.length - 1 ] == '.' ) {
        newstr = str.substr( 0, str.length - 1 );
    }
    else {
        newstr = str;
    }

    return newstr.trim();
}