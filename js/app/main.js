"use strict";

var RANDOM_SEED = 'bacon';
var LIMIT = 75;

var month_str = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
//var total_blurbs = 0;
var reddit_url = "";

$( document ).ready( function ()
{
    Math.seedrandom( RANDOM_SEED );

    var subreddit = localStorage.getItem( 'subreddit' );

    if ( subreddit === null ) {
        subreddit = '';
    }
    else if ( subreddit == 'all' ) {
        subreddit = '';
    }

    // try to get it from localstorage first
    var cached_copy = localStorage.getItem( subreddit + '_json' );

    // if we don't have this feed cached, go get it.
    if ( !cached_copy ) {
        LoadFreshFeed( subreddit );
    }
    else {
        console.log( 'using cached feed' );
        cached_copy = JSON.parse( cached_copy );
        RenderPage( subreddit, cached_copy );
    }

    bindControls( subreddit );
    bindSubreddits( subreddit );
} );

function bindControls( subreddit )
{
    $( "#RefreshButton" ).click( function ()
    {
        //localStorage.clear
        localStorage.removeItem( subreddit + '_json' );
        window.location.reload();
    } );

    $( "#RenderButton" ).click( function ()
    {
//        html2canvas($("#Page" ), {
//            onrendered: function(canvas) {
//                document.body.appendChild(canvas);
//            },
//            width: 600,
//            height: 800
//        })
        alert("Coming soon! You'll have to just hit Print Screen and paste it into MS Paint, or something, for now.\n\n(And make sure you crop the image. Don't be that guy.)");

    } );

}

function bindSubreddits( subreddit )
{
    // Get those subreddit buttons working
    $( "#SubredditList" ).find( "li" ).each( function ( index, el )
    {
        if ( subreddit == $( el ).html() ) {
            $( el ).addClass( 'subreddit-selected' );
        }

        $( el ).click( function ( ev )
        {
            var el = $( ev.target );
            localStorage.setItem( "subreddit", el.html() );
            window.location.reload();
        } );
    } );
}

function RenderHeaderValues( subreddit )
{
    var today = new Date();
    $( "#Date" ).html( month_str[today.getMonth()] + ' ' + today.getFullYear() );

    if ( subreddit != "" ) {
        $( "#Subreddit" ).html( "/r/" + subreddit + " Edition" );
    }
}

function RenderBackgroundImage( posts )
{
    var result = "darkred";

    for ( var i = 0; i < posts.length; i++ ) {
        var url = posts[i].data.url;

        if ( (url.indexOf( 'i.imgur.com' ) >= 0) && ( (url.indexOf( '.jpg' ) >= 0) || (url.indexOf( '.png' )) >= 0) ) {
            result = "url(" + url + ")";
        }
    }

    $( "#BackgroundImage" ).css( 'background-image', result );

}

function LoadFreshFeed( subreddit )
{
    // choose the appropriate source for it
    if ( subreddit == '' ) {
        //reddit_url = "ajax.php?url=reddit.com/.json";
        reddit_url = "http://reddit.com/.json?limit=" + LIMIT + "&jsonp=jsonprec"
    }
    else {
        //reddit_url = "ajax.php?url=reddit.com/r/"+subreddit+"/.json";
        reddit_url = "http://reddit.com/r/" + subreddit + "/.json?limit=" + LIMIT + "&jsonp=jsonprec";
    }

    $.ajax( {
        url: reddit_url, dataType: "jsonp", jsonpCallback: "jsonprec", success: function ( data, textStatus )
        {
            console.log( 'successfully fetched main feed' );
            localStorage.setItem( subreddit + "_json", JSON.stringify( data ) );
            RenderPage( subreddit, data );
        }
    } );
}

function RenderPage( subreddit, subreddit_data )
{
    var posts = subreddit_data.data.children;

    RenderHeaderValues( subreddit );

    // load up the first pretty background we find

    RenderBackgroundImage( posts );

    var total_blurbs = 0;
    $( ".headline_box" ).each( function ( index, el )
    {
        $( el ).attr( 'id', 'blurb' + index );
        total_blurbs++;
    } );

    var max_posts = posts.length;

    if ( max_posts > total_blurbs ) {
        max_posts = total_blurbs;
    }

    var cur_post = 0;

    for ( var i = 0; i < max_posts; i++, cur_post++ ) {
        // make sure we only pick reasonably sized titles
        if ( posts[cur_post] ) {
            while ( posts[cur_post].data.title.length > 50 ) {
                cur_post++;
                if ( cur_post >= posts.length ) {
                    i = max_posts;
                    break;
                }
            }

            if ( posts[cur_post] ) {
                var blurb = $( "#blurb" + i );
                var title = cleanse( posts[cur_post].data.title );

                //if (i == 7) {
                //	title = "bloodfart";
                //}

                blurb.html( "<a href='" + posts[cur_post].data.url + "'>" + title + "</a>" );//"<div class='page'>Page"+((i+1)*4 + Math.round(Math.random(60)))+"</div></a>");
                if ( title.length > 45 ) {
                    blurb.addClass( 'blurb-small' );
                }

                if ( title.length < 22 ) {
                    blurb.addClass( 'blurb-large' );
                }

                if ( title.length >= 22 ) {
                    if ( (Math.random() * 100) < 10 ) {
                        blurb.addClass( 'blurb-style1' );
                    }
                }
            }
        }
    }
}

function cleanse( str )
{
    var newstr;

    if ( str[str.length - 1] == '.' ) {
        newstr = str.substr( 0, str.length - 1 );
    }
    else {
        newstr = str;
    }

    return newstr;
}
