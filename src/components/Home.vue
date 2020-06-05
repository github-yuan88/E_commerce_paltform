<template>
    <el-container class="home-container">
      <el-header>
        <div>
            <img src="../assets/heima.png" alt="">
            <span>电商后台管理系统</span>
        </div>
        <el-button type="info" @click="logout">退出</el-button>
      </el-header>
      <el-container>
        <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggelCollapse">|||</div>
        <!-- active-text-color激活文本颜色 -->
        <el-menu class="el-menu-vertical-demo" background-color="#333744" text-color="#fff" active-text-color="#409EFF"
        :unique-opened="true" :collapse="isCollapse" :collapse-transition="false" router :default-active="activePath">
          <!-- 一级菜单 -->
          <!-- 动态数据绑定index 可以让二级菜单不同时打开和关闭 item.id是数值，但index只接收字符串 -->
          <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 开启路由导航后，用path-->
            <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
         </el-submenu>
        </el-menu>
        </el-aside>
        <el-main>
            <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
</template>

<script>
export default {
  data () {
    return {
      // 左侧的菜单数据
      menulist: [],
      // 左侧菜单图标渲染
      iconsObj: {
        125: 'iconfont icon-users',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      // 收缩左侧菜单
      isCollapse: false,
      activePath: ''
    }
  },
  created () {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    // 退出 清除token
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取所有的主菜单
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
      console.log(res)
    },
    // 点击按钮折叠菜单
    toggelCollapse () {
      this.isCollapse = !this.isCollapse
    },
    // 保存二级菜单中路径到seesion
    saveNavstate (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang= "less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  // 左右贴边对其
  justify-content: space-between;
  padding-left: 0px;
  //按钮居中
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none
  }
}
.el-main {
  background-color: #eaedf1;
}
.iconfont {
  margin-right: 10px;
}
.toggle-button {
  background-color: #4A5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  // 字间间距
  letter-spacing: 0.2em;
  // 箭头变小手
  cursor: pointer;
}
</style>
