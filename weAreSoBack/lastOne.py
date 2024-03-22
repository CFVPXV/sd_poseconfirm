import cv2
import mediapipe as mp
import time
import numpy as np
import random as rng

#See implementation below
def click_event(event, x, y, flags, params):
   if event == cv2.EVENT_LBUTTONDOWN:
      print(f'({x},{y})')

mpDraw = mp.solutions.drawing_utils
mpPose = mp.solutions.pose
pose = mpPose.Pose()
threshold = 95
rng.seed(12345)
img = cv2.imread("finalPoseProbably.jpg")

#cap = cv2.VideoCapture('W:\production_id_4608977 (1080p).mp4')
#while True:
    #success, img = cap.read()
imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB) 
src_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
src_gray = cv2.blur(src_gray, (3,3))

#canny_output = cv2.Canny(imgRGB, threshold, threshold * 2)
canny_output = cv2.Canny(src_gray, threshold, threshold * 2)

#contours, hierarchy = cv2.findContours(canny_output, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
contours, hierarchy = cv2.findContours(canny_output,cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

drawing = np.zeros((canny_output.shape[0], canny_output.shape[1], 3), dtype=np.uint8)
for i in range(len(contours)):
    color = (rng.randint(0,256), rng.randint(0,256), rng.randint(0,256))
    #Could image be src_gray?
    cv2.drawContours(img, contours, i, color, 2, cv2.LINE_8, hierarchy, 1)

results = pose.process(imgRGB)

if results.pose_landmarks:
    mpDraw.draw_landmarks(img, results.pose_landmarks, mpPose.POSE_CONNECTIONS)
        
        #Alternative setup for the video version...fuggetaboudit!
        #for id, lm in enumerate(results.pose_landmarks.landmark):
        #    h, w, c = img.shape
        #    print(id, lm)
        #    cx, cy = int(lm.x * w), int(lm.y * h)
        #    cv2.circle(img, (cx, cy), 5, (255, 0, 0), cv2.FILLED)
    #cTime = time.time()
    #fps = 1 / (cTime - pTime)
    #pTime = cTime
    #cv2.putText(img, str(int(fps)), (70, 50), cv2.FONT_HERSHEY_PLAIN, 3,
                #(255, 0, 0), 3)

landmarks = dict({})
i = 1

for point in results.pose_landmarks.landmark:
    x = point.x
    y = point.y

    shape = img.shape 
    relative_x = int(x * shape[1])
    relative_y = int(y * shape[0])
    landmarks[i] = (relative_x, relative_y)
    i += 1

#Record where mouse was clicked to maintain my sanity...
cv2.namedWindow("Image")
cv2.imshow("Image", img)
cv2.setMouseCallback('Image', click_event)

print(f"Normalized Landmark x for point 12: {results.pose_landmarks.landmark[12].x}")

print(f"Relative (x,y) point for landmark 12: {landmarks[12][0], landmarks[12][1]}")
#print(landmarks[11][0], landmarks[11][1])

#print(landmarks)

# Brute force test below, run at your own risk!

brute_test = dict({})

with open("out.txt", "w") as f:
    for i in range(1000):
        for j in range(1000):
            if cv2.pointPolygonTest(contours[0], (i,j), False) == 0.0:

                f.write(f"({i},{j})" + str(cv2.pointPolygonTest(contours[0], (i, j), False)) + "\n")

#print(cv2.pointPolygonTest(contours[0], (0, 0), False))
print(f"Are we in? {cv2.pointPolygonTest(contours[0], (landmarks[12][0], landmarks[12][1]), False)}")
#print(cv2.pointPolygonTest(contours[0], (results.pose_landmarks.landmark[12].x, results.pose_landmarks.landmark[12].y), False))
#for i in contours[0]:
    #print(i)
print(f"Contour count: {len(contours)}")

#cv2.waitKey()
#Close with q key, just for my special little Linux tiling manager...:
while True:
    k = cv2.waitKey(0) & 0xFF
    if k == ord('q'):
        cv2.destroyAllWindows()
        break
