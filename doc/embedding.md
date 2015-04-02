# Embedding Hubl.in on your website

## The button

Embedding hubl.in in your website currently supports only one method: a button.
Your users will be redirected to hubl.in (or directly to a videoconference if that's desirable) when they click on the button.  
To add a hubl.in button to your website, you can use the following HTML code:

    <a href="https://hubl.in/" target="_blank" class="hublin-link"/></a>
    <script type="text/javascript" src="https://hubl.in/embed/button"></script>

where you want the button to appear in your webpage. The __a__ tag will be styled using CSS to look like a button.

## Opening a videoconference

To direct your users to a videoconference instead of the hubl.in homepage, you can simply add the conference name in the target URL of the __a__ tag you used to embed the button.
For instance, to direct your users to a _my-shiny-website_ conference, you can use the following URL:

    https://hubl.in/my-shiny-website

## Selecting the locale

By default the button will be translated in the user's locale, assuming hubl.in is itself available in this language, with a fallback to english.
You can however "force" the button to display text and tooltip in a given locale by passing the _locale_ query parameter to the _/embed/button_ URL in the __script__ tag.
For instance, if you want the button in french, use:

    <script type="text/javascript" src="https://hubl.in/embed/button?locale=fr"></script>

## Overriding button style

To override the style of the embedded button, simply add a _style_ tag to your HTML document, defining the hublin-widget CSS class.
In this class you can override any CSS attribute of the button.  
For instance, if you want red text, simply use:

    .hublin-widget {
      color: red;
    }

## Working sample

    <html>
      <head>
        <style sype="text/css">
          .hublin-widget {
            color: red;
          }
        </style>
      </head>
      <body>
        <a href="https://hubl.in/my-shiny-conference" target="_blank" class="hublin-link"/></a>
        <script type="text/javascript" src="https://hubl.in/embed/button"></script>
      </body>
    </html>
