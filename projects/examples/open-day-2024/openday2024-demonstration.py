import time
import serial
import matplotlib.pyplot as plt
import matplotlib.animation as animation
import numpy as np
import seaborn as sns
sns.set(style="ticks", font_scale=1.5)

def animate(i, dataList, ser):
    ser.write(b'g')                                     # Transmit the char 'g' to receive the Arduino data point
    line = ser.readline().decode('utf-8').strip()
    value_list = line.split(', ')

    try:
        t = float(value_list[0])
        s1 = float(value_list[1])
        s2 = float(value_list[2])
        s3 = float(value_list[3])
        dataList.append([t, s1, s2, s3])

    except:                                             # Pass if data point is bad                               
        pass
    pts_to_keep = int(60/0.5)
    dataList = dataList[-pts_to_keep:]                           # Fix the list size so that the animation plot 'window' is x number of points
    
    ax1.clear()                                          # Clear last data frame
    ax2.clear()
    ax2b.clear
    t = [d[0] for d in dataList]
    s1 = [d[1] for d in dataList]
    s2 = [d[2] for d in dataList]
    s3 = [d[3] for d in dataList]
    ax1.plot(t, s1, color="tab:blue", lw=3)
    ax2.plot(t, s2, color="tab:orange", lw=3)
    ax1.set(ylim=[20,40],
            # ylabel="temperature (°C)",
            xticklabels=[],
            xlim=[t[0], t[-1]+5]
            )
    ax2.set(ylim=[30,100],
            # ylabel="relative humidity (%)",
            xlabel="time (s)",
            xlim=[t[0], t[-1]+5]
            )
    ax2.plot(ax2.get_xlim(), [80]*2, ls="--", color="black", zorder=0)
    ax1.text(0.5, 0.97, r"temperature (°C)", transform=ax1.transAxes,
         horizontalalignment='center', verticalalignment='top',
         fontweight="bold", fontsize=20, color="tab:blue")
    ax2.text(0.5, 0.97, r"relative humidity (%)", transform=ax2.transAxes,
         horizontalalignment='center', verticalalignment='top',
         fontweight="bold", fontsize=20, color="tab:orange")
    ax1.grid()
    ax2.grid()
    col_2b = 'xkcd:hot pink'
    ax2b.plot(t, s3, color=col_2b, lw=3)
    ax2b.set(ylim=[-0.5,1.5])
    ax2b.tick_params(axis='y', labelcolor=col_2b)
    ax2b.set_yticks([0,1])
    ax2b.set_yticklabels(["fan off", "fan on"])
    

dataList = [] #np.empty((0,3))                              # Create empty list variable for later use
                                                        
fig, (ax1, ax2) = plt.subplots(2, 1)#, sharex=True)
ax1.plot([], [], color="tab:blue")
ax2.plot([], [], color="tab:orange")
ax2b = ax2.twinx() 

ser = serial.Serial("/dev/ttyUSB0", 9600)                       # Establish Serial object with COM port and BAUD rate to match Arduino Port/rate
time.sleep(2)                                           # Time delay for Arduino Serial initialization 

                                                        # Matplotlib Animation Fuction that takes takes care of real time plot.
                                                        # Note that 'fargs' parameter is where we pass in our dataList and Serial object. 
ani = animation.FuncAnimation(fig, animate, frames=100, fargs=(dataList, ser), interval=500) 

plt.show()                                              # Keep Matplotlib plot persistent on screen until it is closed
ser.close()                                             # Close Serial connection when plot is closed

