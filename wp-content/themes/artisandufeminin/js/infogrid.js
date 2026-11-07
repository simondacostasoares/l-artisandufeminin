/*
Copyright (C) 2000 Free Software Foundation, Inc. See LICENSE.txt
*//*
Copyright (C) 2000 Free Software Foundation, Inc. See LICENSE.txt
*//*
Copyright (C) 2000 Free Software Foundation, Inc. See LICENSE.txt
*//*
Copyright (C) 2000 Free Software Foundation, Inc. See LICENSE.txt
*//*
Copyright (C) 2000 Free Software Foundation, Inc. See LICENSE.txt
*//*
Copyright (C) 2000 Free Software Foundation, Inc. See LICENSE.txt
*//*
Copyright (C) 2000 Free Software Foundation, Inc. See LICENSE.txt
*//*
Copyright (C) 2000 Free Software Foundation, Inc. See LICENSE.txt
*//*
Copyright (C) 2000 Free Software Foundation, Inc. See LICENSE.txt
*//*
Copyright (C) 2000 Free Software Foundation, Inc. See LICENSE.txt
*//*
Copyright (C) 2000 Free Software Foundation, Inc. See LICENSE.txt
*//*
Copyright (C) 2000 Free Software Foundation, Inc. See LICENSE.txt
*//*
Copyright (C) 2000 Free Software Foundation, Inc. See LICENSE.txt
*//*
Copyright (C) 2000 Free Software Foundation, Inc. See LICENSE.txt
*//*
Copyright (C) 2000 Free Software Foundation, Inc. See LICENSE.txt
*//*
Copyright (C) 2000 Free Software Foundation, Inc. See LICENSE.txt
*//*
Copyright (C) 2000 Free Software Foundation, Inc. See LICENSE.txt
*//*
Copyright (C) 2000 Free Software Foundation, Inc. See LICENSE.txt
*//*
Copyright (C) 2000 Free Software Foundation, Inc. See LICENSE.txt
*//*
Copyright (C) 2000 Free Software Foundation, Inc. See LICENSE.txt
*//*
Copyright (C) 2000 Free Software Foundation, Inc. See LICENSE.txt
*/$(function() {

    // Set up variables
    var $el, $parentWrap, $otherWrap, 
        $allTitles = $("li.rubric").css({
            padding: 5, // setting the padding here prevents a weird situation, where it would start animating at 0 padding instead of 5
            "cursor": "pointer" // make it seem clickable
        }),
        $allCells = $("li.rubcontent").css({
          
            display: "none" // info cells are just kicked off the page with CSS (for accessibility)
        });
    
    // clicking image of inactive column just opens column, doesn't go to link   
    $("#carouselwrap").delegate("a.image","click", function(e) { 
        
        if ( !$(this).parent().hasClass("curCol") ) {         
            e.preventDefault(); 
            $(this).next().find('li.rubric.vide').click(); 
        } 
        
    });
    
    // clicking on titles does stuff
    $("#carouselwrap").delegate("li.rubric", "click", function() {
        
        // cache this, as always, is good form
        $el = $(this);
        
        // if this is already the active cell, don't do anything
        if (!$el.hasClass("current")) {
        
            $parentWrap = $el.parent().parent();
            $otherWraps = $(".info-col").not($parentWrap);
            
            // remove current cell from selection of all cells
            $allTitles = $("li.rubric").not(this);
            
            // close all info cells
            $allCells.slideUp();
            
            // return all titles (except current one) to normal size
            $allTitles.animate({
                fontSize: "14px",
               
            });
            
            // animate current title to larger size            
            $el.animate({
                "font-size": "14px",
                
            }).next().slideDown();
            
            // make the current column the large size
            $parentWrap.animate({
                width: 740
            }).addClass("curCol");
            
            // make other columns the small size
            $otherWraps.animate({
                width: 140
            }).removeClass("curCol");
            
            // make sure the correct column is current
            $allTitles.removeClass("current");
            $el.addClass("current");  
        
        }
        
    });
    
    $("#starer").trigger("click");
    
});