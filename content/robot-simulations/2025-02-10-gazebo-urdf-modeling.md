---
title: "在 Gazebo 中使用 URDF 构建机器人模型"
date: 2025-02-10
type: "指南"
simulator: "Gazebo"
tags: ["URDF", "Gazebo", "机器人建模"]
excerpt: "学习如何使用 URDF（统一机器人描述格式）创建逼真的机器人模型，并在 Gazebo 中进行仿真。"
---

# 在 Gazebo 中使用 URDF 构建机器人模型

URDF 是在 ROS 中描述机器人结构的标准格式。本指南将带你一步步创建并在 Gazebo 中仿真自己的机器人模型。

## URDF 结构

一个 URDF 文件通常由以下部分组成：
- **Link（连杆）**：刚体部分（例如底盘、车轮、传感器）
- **Joint（关节）**：连接各个连杆的约束关系
- **Sensors（传感器）**：例如相机、激光雷达（Lidar）、IMU 等

## 示例：简易差速驱动机器人

```xml
<?xml version="1.0"?>
<robot name="my_robot">
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.5 0.3 0.1"/>
      </geometry>
    </visual>
  </link>
  
  <link name="left_wheel">
    <visual>
      <geometry>
        <cylinder radius="0.1" length="0.05"/>
      </geometry>
    </visual>
  </link>
  
  <joint name="left_wheel_joint" type="continuous">
    <parent link="base_link"/>
    <child link="left_wheel"/>
    <axis xyz="0 0 1"/>
  </joint>
</robot>
```

## Gazebo 集成

在 URDF/SDF 中添加 Gazebo 专用属性，用于物理仿真、材质外观以及插件（plugins）的配置。
