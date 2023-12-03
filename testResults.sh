echo "StartTime Hash EndorseTime CommitTime TotalTime" > teste20x100.csv
for i in {1..20}; do
  (sudo node dist/client.js createAssetEndorse 100 B) &
done >> teste.csv
wait
