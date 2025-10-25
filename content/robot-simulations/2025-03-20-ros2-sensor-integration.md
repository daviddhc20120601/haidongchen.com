---
title: "在 ROS2 仿真中集成传感器"
date: 2025-03-20
type: "教程"
simulator: "Gazebo"
tags: ["ROS2", "传感器", "激光雷达", "相机"]
excerpt: "一份在 ROS2 + Gazebo 仿真中集成多种传感器（激光雷达、相机、IMU 等）的完整实践指南。"
---

# 在 ROS2 仿真中集成传感器

传感器是自主机器人的关键组成部分。本文演示如何在 ROS2 + Gazebo 仿真环境中添加并配置多种传感器。

## 前置条件

开始之前，请确保：
- 已安装 ROS2 Humble 或更高版本
- 已安装 Gazebo（Garden 或 Fortress 版本）
- 了解 URDF/SDF 的基本概念

## 添加激光雷达（Lidar）

### 1. 安装依赖包

```bash
sudo apt-get install ros-humble-gazebo-ros-pkgs
sudo apt-get install ros-humble-sensor-msgs
```

### 2. 在 URDF 中定义 Lidar

```xml
<gazebo reference="laser_frame">
  <sensor name="laser_sensor" type="gpu_ray">
    <pose>0 0 0 0 0 0</pose>
    <visualize>true</visualize>
    <update_rate>10</update_rate>
    <ray>
      <scan>
        <horizontal>
          <samples>360</samples>
          <resolution>1</resolution>
          <min_angle>-3.14159</min_angle>
          <max_angle>3.14159</max_angle>
        </horizontal>
      </scan>
      <range>
        <min>0.10</min>
        <max>30.0</max>
        <resolution>0.01</resolution>
      </range>
    </ray>
    <plugin name="laser_controller" filename="libgazebo_ros_ray_sensor.so">
      <ros>
        <namespace>/robot</namespace>
        <remapping>~/out:=scan</remapping>
      </ros>
      <output_type>sensor_msgs/LaserScan</output_type>
      <frame_name>laser_frame</frame_name>
    </plugin>
  </sensor>
</gazebo>
```

## 添加相机（Camera）

### 相机插件配置

```xml
<gazebo reference="camera_link">
  <sensor name="camera_sensor" type="camera">
    <update_rate>30</update_rate>
    <camera name="front_camera">
      <horizontal_fov>1.3962634</horizontal_fov>
      <image>
        <width>800</width>
        <height>600</height>
        <format>R8G8B8</format>
      </image>
      <clip>
        <near>0.02</near>
        <far>300</far>
      </clip>
    </camera>
    <plugin name="camera_controller" filename="libgazebo_ros_camera.so">
      <ros>
        <namespace>/robot</namespace>
        <remapping>image_raw:=camera/image_raw</remapping>
        <remapping>camera_info:=camera/camera_info</remapping>
      </ros>
      <camera_name>front_camera</camera_name>
      <frame_name>camera_link</frame_name>
    </plugin>
  </sensor>
</gazebo>
```

## Python 节点：处理传感器数据

```python
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import LaserScan, Image
from cv_bridge import CvBridge
import cv2

class SensorProcessor(Node):
    def __init__(self):
        super().__init__('sensor_processor')
        
  # 订阅激光雷达数据
        self.scan_subscription = self.create_subscription(
            LaserScan,
            '/robot/scan',
            self.scan_callback,
            10)
        
  # 订阅相机数据
        self.image_subscription = self.create_subscription(
            Image,
            '/robot/camera/image_raw',
            self.image_callback,
            10)
        
        self.bridge = CvBridge()
  self.get_logger().info('Sensor Processor 节点已启动')
    
    def scan_callback(self, msg):
  # 处理激光雷达数据
        min_distance = min(msg.ranges)
  self.get_logger().info(f'最小距离: {min_distance:.2f}m')
    
    def image_callback(self, msg):
  # 将 ROS Image 转换为 OpenCV 格式
        cv_image = self.bridge.imgmsg_to_cv2(msg, 'bgr8')
        
  # 简单的图像处理
        gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        
  # 显示（用于调试）
        cv2.imshow('Edges', edges)
        cv2.waitKey(1)

def main(args=None):
    rclpy.init(args=args)
    processor = SensorProcessor()
    rclpy.spin(processor)
    processor.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## 启动文件示例（Launch）

```python
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='gazebo_ros',
            executable='spawn_entity.py',
            arguments=['-entity', 'my_robot', '-topic', 'robot_description'],
            output='screen'
        ),
        Node(
            package='my_robot_pkg',
            executable='sensor_processor',
            output='screen'
        ),
    ])
```

## 测试你的传感器

启动仿真并验证传感器数据：

```bash
# 终端 1：启动 Gazebo
ros2 launch my_robot_pkg simulation.launch.py

# 终端 2：查看话题
ros2 topic list

# 终端 3：回显激光雷达数据
ros2 topic echo /robot/scan

# 终端 4：在 RViz 中可视化
ros2 run rviz2 rviz2
```

## 常见问题与解决方案

| 问题 | 解决方案 |
|------|----------|
| 没有传感器数据 | 检查插件是否正确加载 |
| 更新率过低 | 增大传感器的 update_rate 参数 |
| RViz 无法显示数据 | 确认 frame_id 与 URDF 中的坐标系一致 |

## 下一步

- 添加深度相机以支持 3D 感知
- 实现传感器融合算法
- 配置传感器噪声模型以获得更真实的仿真效果

> 提示：务必在 RViz 中可视化你的传感器数据，及时发现并修正配置问题。
