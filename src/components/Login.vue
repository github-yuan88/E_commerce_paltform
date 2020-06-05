<template>
    <div class="login_container">
        <div class="login_box">
            <!-- 头像 -->
            <div class="avatar_box">
                <img src="../assets/logo.png" alt="">
            </div>
            <!-- 登录表单 引入：modal数据绑定 ref表单的引用对象-->
            <el-form :model="ruleForm" :rules="rules" ref="ruleForm" class="login_form">
              <!-- 用户名 -->
                <el-form-item  prop="username">
                    <el-input v-model="ruleForm.username" prefix-icon="iconfont icon-user"></el-input>
                </el-form-item>
                <!-- 密码 -->
                <el-form-item prop="password">
                    <el-input v-model="ruleForm.password" prefix-icon="iconfont icon-3702mima" type="password"></el-input>
                </el-form-item>
                <!-- 按钮 -->
                <el-form-item class="btn_s">
                    <el-button type="primary" @click="login">提交</el-button>
                    <el-button type="info" @click="resetloginFrom">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
export default {
  data () {
    return {
      // 登陆表单数据对象绑定
      ruleForm: {
        username: 'admin',
        password: '123456'
      },
      // 表单规则验证
      rules: {
        // 验证用户名是否合法
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 18, message: '长度在 6 到 18 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    resetloginFrom () {
      // console.log(this)
      this.$refs.ruleForm.resetFields()
    },
    login () {
      this.$refs.ruleForm.validate(async valid => {
        if (!valid) return false
        // 第一个参数是后端的路由，第二个是参数可直接把数据绑定内容填入（但与后端参数要相同）
        // const result = await this.$http.post('login', this.ruleForm)
        // 如果某个方法返回是promise,可以用async,await来简化，awiat紧挨的方法改为异步
        // console.log(result)
        // 返回的有6个，但只有data可用
        const { data: res } = await this.$http.post('login', this.ruleForm)
        // console.log(res)
        if (res.meta.status !== 200) return this.$message.error('登陆失败')
        this.$message.success('登陆成功')
        // 将登陆成功之后的token保存到客户端的 sessionStorage
        // 项目中除登陆之外的其他接口，必须在登陆之后才能访问  token在打开之间生效
        // 通过编程式导航跳转到后台主页，路由是/home
        console.log(res)
        window.sessionStorage.setItem('token', res.data.token)
        // 跳转到主页面 编程式导航
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container{
    background-color: #2b4b6b;
    height: 100%;
}
.login_box{
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;        //圆角边框
    position: absolute;        //绝对定位
    left: 50%;
    top: 50%;
    transform: translate(-50% , -50%);  //添加位移
}
.login_box .avatar_box{
    height: 130px;
    width: 130px;
    border: 1px soild #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50% , -50%);
    background-color: #fff;
    img{
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #0c65b8;
    }
}
.login_form {  //让表单底部对齐
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;  //让表单为盒子，否则文本框会出去
}
.btn_s {
  display: flex; //弹性盒模型
  justify-content: flex-end;
}
</style>
