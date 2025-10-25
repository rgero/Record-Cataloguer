<!-- omit in toc -->
# Record Cataloguer
For my partner's birthday in 2025, I purchased them a record player. After that, we quickly dove into the world of records, quickly amassing nearly a dozen from some of our favorite artists. This started to present a problem. How do we remember which records we already bought?
**That's the goal of this website.**
There are already tools out there that let you do this, but some charge a monthly subscription that I'd like to avoid if possible. Plus this kind of stuff is fun to play with.

<!-- omit in toc -->
## Table of Contents
- [What features do I want?](#what-features-do-i-want)
- [What data do I want to get?](#what-data-do-i-want-to-get)
  - [How to get the data?](#how-to-get-the-data)
- [Friendships?](#friendships)
- [Locations](#locations)

---
## What features do I want?
I want the ability to easily add, manipulate, view and share a list of records that I own, as well as the ones that are in my household

## What data do I want to get?
Right now I am thinking that the following data would be worth tracking
- Artist Name
- Album Name
- Price
- Location Purchased
- Date Purchased
- Who purchased
- Any notes

I feel that the only required fields will be artist name, album name, and who purchased it. The rest could be used to drive metrics. I enjoy the idea of making a catalog of business that we've purchased records from, so we can see how many we've purchased from where.

### How to get the data?
The first thought is that nearly every record will have a bar code. So it could be interesting to use the a module that scans the barcode, gets whatever data I can from that and populates a form that the user can then edit/complete.

## Friendships?
There's one thing I am thinking of. Right now I want to be able to see every record in my household. I want to be able to share that data. However a household is also different from me. So it might be worth making so I have the ability to add a user as a friend? Is there going to be a different level that does "combined library" or a "household" library. This seems more like a display issue though once the data is already in the database.

## Locations
This might be worth just plugging into a maps service like Google Maps, so we can enter the name of the business and pulls the data from there. It might be wise to store this data locally since we'd likely have frequent hitters. I'd rather have the same entry used every time so that way when we query for all records purchased from a place, we get the correct data.
