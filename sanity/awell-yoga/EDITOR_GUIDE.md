# A-WELL CMS Quick Guide

## Edit order (best workflow)
1. **Schedule Page Settings**: heading text + studio hours
2. **Events / Classes**: add schedule items
3. **Announcements**: short banner messages
4. **Calendar View**: check how events look on the live schedule grid

## Use Live Preview (recommended)
- Open any item, then click the **Live Preview** tab beside **Edit**.
- Keep your website running locally (`http://localhost:4200`) while editing.
- This preview shows how the real page looks while you update fields.

## How to replace a photo
1. Open the page or event you want to edit.
2. Go to the field labeled **Image**, **Photo**, or **Main Event Photo**.
3. Click the current image.
4. Choose **Replace** or drag a new file directly into the image box.
5. Update the **Alt Text** field if it is shown.
6. Click **Publish**.

Tips:
- Photos from iPhone text messages work fine if you save them first.
- Wider photos work best for banners and hero sections.
- Portrait photos work best for instructor headshots.
- If you are unsure, upload it anyway. Cropping can be adjusted with the hotspot tool.

## Click-to-edit mode
- In Sanity Studio, open the **Presentation** tool.
- Click **Open preview**.
- In preview mode, click content on the page to jump to its document/field in Studio.
- This works best on Sanity-managed schedule content (schedule settings, events, announcements).

## Events / Classes checklist
For each event, fill in:
- Event Name
- Event Type
- Start Date & Time
- Location
- Price Text (optional)
- Stripe Checkout URL or Stripe Price ID (depending on how that event is set up)
- Main Event Photo (optional but recommended)
- Show on Website = ON

If something is missing on the booking side, stop and check with the dev side before publishing. Some events are powered by custom Stripe / Supabase flows rather than a simple link.

## Delete an event
- Open **Events / Classes**
- Open the event you want to remove
- Click the **...** menu (top right) and choose **Delete**
- Publish if prompted

## If something is not showing on the website
- Confirm **Show on Website** is ON
- Check dates are correct (for events/announcements)
- Save and refresh the website page
- If it still does not show, it may be because that section is not fully CMS-driven yet

## Best places to change photos
- **Homepage**: hero photo
- **About Page**: story + philosophy photos
- **Studio Page**: schedule photo
- **Instructors**: headshots
- **Events / Classes**: main event photo + extra photos

## When to ask for help
- booking button goes somewhere unexpected
- class is published but won’t show on the calendar
- payment text and actual checkout amount don’t match
- an old image keeps showing after you replaced it
