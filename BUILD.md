# Building

### Icons
apt install -y imagemagick

mkdir assets
curl -o assets/logo.jpg "https://media.istockphoto.com/id/157644325/photo/water-drop.jpg?s=612x612&w=0&k=20&c=O8khr7owdRAntRRK2R42a4TDGxBsb3J1_jNbSGyBmW8="
mogrify -format png assets/*.jpg
rm assets/logo.jpg

https://github.com/ionic-team/capacitor-assets

npm install --save-dev @capacitor/assets

ionic build

# TODO: should be possible to include with build
npx @capacitor/assets generate --iconBackgroundColor '#eeeeee' --iconBackgroundColorDark '#222222' --splashBackgroundColor '#eeeeee' --splashBackgroundColorDark '#111111' --pwaManifestPath dist/manifest.webmanifest

aws s3 sync --acl public-read --delete dist/ s3://public230319/
aws s3 sync --acl public-read icons s3://public230319/icons

# TODO: should be possible to fix config so this is generated correctly
Manually fix dist/manifest.webmanifest 
remove ../ from icon path

Remove from Home Screen, reload and add again
