for i in {1..20}; do
  (sudo node dist/client.js createAssetEndorse 100 > 20) &
done
wait
